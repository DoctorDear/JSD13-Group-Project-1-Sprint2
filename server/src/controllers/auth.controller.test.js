import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import {
  getAuthCookieOptions,
  login,
  logout,
  changePassword,
} from "./auth.controller.js";

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    cookies: [],
    clearedCookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    cookie(name, value, options) {
      this.cookies.push({ name, value, options });
      return this;
    },
    clearCookie(name, options) {
      this.clearedCookies.push({ name, options });
      return this;
    },
  };
}

test("getAuthCookieOptions sets environment-appropriate httpOnly, secure, sameSite, and maxAge", () => {
  const devOpts = getAuthCookieOptions({ NODE_ENV: "development" });
  assert.deepEqual(devOpts, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const prodOpts = getAuthCookieOptions({ NODE_ENV: "production" });
  assert.deepEqual(prodOpts, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
});

test("login sets accessToken cookie and omits raw token from JSON response body", async () => {
  const originalFindOne = User.findOne;
  const originalCompare = bcrypt.compare;
  const originalSign = jwt.sign;
  const prevSecret = process.env.JWT_SECRET;
  const prevEnv = process.env.NODE_ENV;

  try {
    process.env.JWT_SECRET = "test-secret";
    process.env.NODE_ENV = "production";
    User.findOne = async () => ({
      _id: "user-1",
      firstName: "Somchai",
      lastName: "Jaidee",
      email: "somchai@example.com",
      role: "user",
      password: "hashed-password",
    });
    bcrypt.compare = async () => true;
    jwt.sign = () => "signed-jwt";

    const res = makeRes();
    await login(
      { body: { email: "somchai@example.com", password: "secret" } },
      res,
      (err) => {
        throw err;
      },
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.cookies.length, 1);
    assert.equal(res.cookies[0].name, "accessToken");
    assert.equal(res.cookies[0].value, "signed-jwt");
    assert.deepEqual(res.cookies[0].options, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    assert.equal("token" in res.body, false);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.email, "somchai@example.com");
  } finally {
    User.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
    jwt.sign = originalSign;
    if (prevSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = prevSecret;
    if (prevEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevEnv;
  }
});

test("logout clears accessToken cookie with matching cookie flags", () => {
  const prevEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    const res = makeRes();
    logout({}, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.clearedCookies, [
      {
        name: "accessToken",
        options: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        },
      },
    ]);
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevEnv;
  }
});

test("changePassword validates current password, confirmPassword, and updates hash when valid", async () => {
  const originalFindById = User.findById;
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;
  const originalCompare = bcrypt.compare;
  const originalHash = bcrypt.hash;

  let updatedArgs = null;

  try {
    // Missing oldPassword/newPassword
    const resMissing = makeRes();
    await changePassword(
      { user: { userId: "u1" }, body: { newPassword: "NewPass123!" } },
      resMissing,
      (err) => {
        throw err;
      },
    );
    assert.equal(resMissing.statusCode, 400);

    // Mismatched confirmPassword
    const resMismatch = makeRes();
    await changePassword(
      {
        user: { userId: "u1" },
        body: {
          oldPassword: "OldPass123!",
          newPassword: "NewPass123!",
          confirmPassword: "Different123!",
        },
      },
      resMismatch,
      (err) => {
        throw err;
      },
    );
    assert.equal(resMismatch.statusCode, 400);
    assert.equal(resMismatch.body.message, "New password and confirm password do not match");

    // Same newPassword as oldPassword
    const resSame = makeRes();
    await changePassword(
      {
        user: { userId: "u1" },
        body: {
          oldPassword: "SamePass123!",
          newPassword: "SamePass123!",
          confirmPassword: "SamePass123!",
        },
      },
      resSame,
      (err) => {
        throw err;
      },
    );
    assert.equal(resSame.statusCode, 400);

    // Wrong current password
    User.findById = async () => ({ _id: "u1", password: "stored-hash" });
    bcrypt.compare = async () => false;
    const resWrong = makeRes();
    await changePassword(
      {
        user: { userId: "u1" },
        body: { oldPassword: "WrongPassword", newPassword: "NewPass123!" },
      },
      resWrong,
      (err) => {
        throw err;
      },
    );
    assert.equal(resWrong.statusCode, 400);
    assert.equal(resWrong.body.message, "Current password is incorrect");

    // Valid password change
    bcrypt.compare = async (plain, hash) => {
      assert.equal(plain, "OldPass123!");
      assert.equal(hash, "stored-hash");
      return true;
    };
    bcrypt.hash = async (plain, rounds) => {
      assert.equal(plain, "NewPass123!");
      assert.equal(rounds, 12);
      return "new-hashed-pw";
    };
    User.findByIdAndUpdate = async (id, update) => {
      updatedArgs = { id, update };
    };

    const resOk = makeRes();
    await changePassword(
      {
        user: { userId: "u1" },
        body: {
          oldPassword: "OldPass123!",
          newPassword: "NewPass123!",
          confirmPassword: "NewPass123!",
        },
      },
      resOk,
      (err) => {
        throw err;
      },
    );
    assert.equal(resOk.statusCode, 200);
    assert.deepEqual(resOk.body, {
      success: true,
      message: "Password changed successfully!",
    });
    assert.deepEqual(updatedArgs, {
      id: "u1",
      update: { password: "new-hashed-pw" },
    });
  } finally {
    User.findById = originalFindById;
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
    bcrypt.compare = originalCompare;
    bcrypt.hash = originalHash;
  }
});
