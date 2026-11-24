import test from "node:test";
import assert from "node:assert/strict";
import { getAllowedOrigins, isAllowedOrigin } from "./cors.js";
import { validateUploadOrigin } from "../middlewares/imageUpload.middleware.js";

test("getAllowedOrigins includes dev origins, FRONTEND_URL, trimmed CORS_ALLOWED_ORIGINS, and deduplicates", () => {
  const origins = getAllowedOrigins({
    FRONTEND_URL: "https://zeta.example.com",
    CORS_ALLOWED_ORIGINS: " https://admin.zeta.example.com , , https://zeta.example.com ",
  });

  assert.deepEqual(origins, [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://zeta.example.com",
    "https://admin.zeta.example.com",
  ]);
});

test("isAllowedOrigin returns true only for non-empty allowed origins", () => {
  const env = {
    FRONTEND_URL: "https://shop.example.com",
    CORS_ALLOWED_ORIGINS: "https://preview.example.com",
  };

  assert.equal(isAllowedOrigin("http://localhost:5173", env), true);
  assert.equal(isAllowedOrigin("https://shop.example.com", env), true);
  assert.equal(isAllowedOrigin("https://preview.example.com", env), true);
  assert.equal(isAllowedOrigin("https://evil.example.com", env), false);
  assert.equal(isAllowedOrigin("", env), false);
  assert.equal(isAllowedOrigin(undefined, env), false);
});

test("validateUploadOrigin allows missing or allowed origins and rejects unknown origins with 403", () => {
  const prevFrontend = process.env.FRONTEND_URL;
  process.env.FRONTEND_URL = "https://upload.example.com";

  try {
    const makeRes = () => ({
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    });

    // Missing origin header passes through
    let nextCalled = false;
    validateUploadOrigin({ get: () => undefined }, makeRes(), () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);

    // Allowed origin passes through
    nextCalled = false;
    validateUploadOrigin({ get: (name) => (name === "origin" ? "https://upload.example.com" : undefined) }, makeRes(), () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);

    // Disallowed origin returns 403 and does not call next
    nextCalled = false;
    const blockedRes = makeRes();
    validateUploadOrigin({ get: (name) => (name === "origin" ? "https://evil.example.com" : undefined) }, blockedRes, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, false);
    assert.equal(blockedRes.statusCode, 403);
    assert.deepEqual(blockedRes.body, { message: "This website is not allowed to upload images." });
  } finally {
    if (prevFrontend === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = prevFrontend;
  }
});
