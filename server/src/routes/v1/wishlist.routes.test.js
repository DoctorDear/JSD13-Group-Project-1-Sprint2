import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import User from "../../models/User.model.js";
import userRoutes from "./user.routes.js";

const userId = "507f1f77bcf86cd799439011";
const productId = "507f1f77bcf86cd799439012";

async function startServer(app) {
  const server = app.listen(0, "127.0.0.1");
  if (!server.listening) {
    await new Promise((resolve) => server.once("listening", resolve));
  }
  return server;
}

test("wishlist routes require authentication", async () => {
  const app = express();
  app.use(cookieParser());
  app.use("/api/v1/users", userRoutes);
  const server = await startServer(app);
  try {
    const base = `http://127.0.0.1:${server.address().port}/api/v1/users/wishlist`;
    for (const [method, url] of [
      ["GET", base],
      ["POST", `${base}/${productId}`],
      ["DELETE", `${base}/${productId}`],
    ]) {
      const res = await fetch(url, { method });
      assert.equal(res.status, 401, `${method} ${url}`);
    }
  } finally {
    server.close();
  }
});

test("signed-in user can GET wishlist through the route", async () => {
  const previousSecret = process.env.JWT_SECRET;
  const originalFindById = User.findById;
  process.env.JWT_SECRET = "wishlist-test-secret";
  User.findById = (id) => {
    assert.equal(id, userId);
    return { populate: async () => ({ wishlist: [{ _id: productId }] }) };
  };
  const app = express();
  app.use(cookieParser());
  app.use("/api/v1/users", userRoutes);
  const server = await startServer(app);
  try {
    const token = jwt.sign({ userId, role: "user" }, process.env.JWT_SECRET);
    const res = await fetch(
      `http://127.0.0.1:${server.address().port}/api/v1/users/wishlist`,
      { headers: { cookie: `accessToken=${token}` } },
    );
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      success: true,
      wishlist: [{ _id: productId }],
    });
  } finally {
    server.close();
    User.findById = originalFindById;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
