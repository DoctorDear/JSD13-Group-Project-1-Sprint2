import assert from "node:assert/strict";
import { test } from "node:test";
import cors from "cors";
import express from "express";
import { corsOptions } from "./cors.js";

test("the API accepts credentialed requests from either local Vite hostname", async (t) => {
  const app = express();
  app.use(cors(corsOptions));
  app.get("/api/v1/products", (_req, res) => res.json({ products: [] }));
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  for (const origin of [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
  ]) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/products`, {
      headers: { Origin: origin },
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
    assert.equal(response.headers.get("access-control-allow-credentials"), "true");
  }
});
