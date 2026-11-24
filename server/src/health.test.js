import test from "node:test";
import assert from "node:assert/strict";
import { app } from "./server.js";

test("GET /health returns 200 ok with ISO timestamp without auth or DB", async () => {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const getResponse = await fetch(`${baseUrl}/health`);
    assert.equal(getResponse.status, 200);
    const body = await getResponse.json();
    assert.equal(body.status, "ok");
    assert.equal(typeof body.timestamp, "string");
    assert.ok(!Number.isNaN(Date.parse(body.timestamp)));

    const headResponse = await fetch(`${baseUrl}/health`, { method: "HEAD" });
    assert.equal(headResponse.status, 200);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
