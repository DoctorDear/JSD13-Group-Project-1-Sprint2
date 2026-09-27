import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { isSafeImageUrl, PersonalizationTemplate } from "../models/PersonalizationTemplate.model.js";
import { Product } from "../models/Product.model.js";
import { resolvePersonalizationTemplate } from "../lib/personalizationTemplate.js";
import { getProductById } from "./product.controller.js";
import { updatePersonalizationTemplate } from "./personalizationTemplate.controller.js";
import personalizationTemplateRoutes from "../routes/v1/personalizationTemplate.routes.js";

const activeTemplate = {
  groupId: "LFC-2627-HOME",
  active: true,
  backImageUrl: "/images/personalization/liverpool-home-26-27-back.jpeg",
  viewBox: [0, 0, 1000, 1000],
  name: { x: 500, y: 255, fontId: "barlow-condensed-900", fontSize: 80, fontWeight: 900, letterSpacing: 4, fill: "#f8f6ed", stroke: "#7d1024", strokeWidth: 3 },
  number: { x: 500, y: 605, fontId: "barlow-condensed-900", fontSize: 315, fontWeight: 900, letterSpacing: 4, fill: "#f8f6ed", stroke: "#7d1024", strokeWidth: 5 },
  sleeveBadge: { x: 789, y: 293, rotate: -15, skewY: 8, scaleX: 0.684, scaleY: 1.032, zoomViewBox: [710, 175, 175, 310], clipPath: "M 740 175 L 787 175 Q 809 230 816 275 Q 828 335 841 421 L 740 460 Z" },
  sleeveBadgeOptions: ["none", "premier-league", "premier-league-racism"],
};

function withTemplateFindOne(t, result) {
  const original = PersonalizationTemplate.findOne;
  t.after(() => { PersonalizationTemplate.findOne = original; });
  PersonalizationTemplate.findOne = async () => result;
}

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

test("resolver returns the active template for an opted-in matching product", async (t) => {
  withTemplateFindOne(t, activeTemplate);
  const result = await resolvePersonalizationTemplate({
    personalizationEnabled: true,
    personalizationGroupId: "LFC-2627-HOME",
  });
  assert.equal(result.groupId, "LFC-2627-HOME");
});

test("resolver returns null when personalization is disabled", async (t) => {
  withTemplateFindOne(t, activeTemplate);
  assert.equal(await resolvePersonalizationTemplate({
    personalizationEnabled: false,
    personalizationGroupId: "LFC-2627-HOME",
  }), null);
});

test("resolver returns null for inactive, missing, malformed, or mismatched templates", async (t) => {
  withTemplateFindOne(t, { ...activeTemplate, active: false });
  assert.equal(await resolvePersonalizationTemplate({ personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME" }), null);

  withTemplateFindOne(t, null);
  assert.equal(await resolvePersonalizationTemplate({ personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME" }), null);

  withTemplateFindOne(t, { ...activeTemplate, viewBox: [0, 0, Number.NaN, 1000] });
  assert.equal(await resolvePersonalizationTemplate({ personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME" }), null);

  withTemplateFindOne(t, { ...activeTemplate, groupId: "OTHER-GROUP" });
  assert.equal(await resolvePersonalizationTemplate({ personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME" }), null);
});

test("template schema rejects unsafe geometry, font, badge, and image values", async () => {
  const template = new PersonalizationTemplate({
    ...activeTemplate,
    viewBox: [0, 0, Number.NaN, 1000],
    name: { ...activeTemplate.name, fontId: "untrusted-font", x: "translate(1)" },
    backImageUrl: "javascript:alert(1)",
    sleeveBadgeOptions: ["untrusted-badge"],
    sleeveBadge: { ...activeTemplate.sleeveBadge, clipPath: "url(javascript:alert(1))" },
  });
  await assert.rejects(template.validate());
});

test("image URLs accept HTTPS and same-origin local paths only", () => {
  assert.equal(isSafeImageUrl("https://cdn.example.test/image.png"), true);
  assert.equal(isSafeImageUrl("/images/image.png"), true);
  assert.equal(isSafeImageUrl("/\\cdn.example.test/image.png"), false);
  assert.equal(isSafeImageUrl("/images/bad\nimage.png"), false);
  assert.equal(isSafeImageUrl("http://cdn.example.test/image.png"), false);
});

test("template PATCH rejects dotted path updates before reaching Mongo", async (t) => {
  const originalFindOneAndUpdate = PersonalizationTemplate.findOneAndUpdate;
  let updateCalls = 0;
  PersonalizationTemplate.findOneAndUpdate = async () => {
    updateCalls += 1;
    return activeTemplate;
  };
  t.after(() => { PersonalizationTemplate.findOneAndUpdate = originalFindOneAndUpdate; });

  for (const unsafeUpdate of [{ "viewBox.4": 1 }, { "viewBox.2": "Infinity" }]) {
    let status;
    let response;
    await updatePersonalizationTemplate(
      { body: { groupId: "LFC-2627-HOME", ...unsafeUpdate } },
      { status(value) { status = value; return this; }, json(value) { response = value; return this; } },
      (error) => { throw error; },
    );
    assert.equal(status, 400);
    assert.equal(response.error, "Unsupported template field");
  }
  assert.equal(updateCalls, 0);
});

test("public group read resolves only an active matching template", async (t) => {
  withTemplateFindOne(t, activeTemplate);
  const app = express();
  app.use(express.json());
  app.use("/api/v1/personalization-templates", personalizationTemplateRoutes);
  const server = await startServer(app);
  t.after(() => server.close());

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/personalization-templates/LFC-2627-HOME`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).template.groupId, "LFC-2627-HOME");
});

test("template list and mutations require admin authentication", async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "template-test-secret";
  t.after(() => {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  });
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/v1/personalization-templates", personalizationTemplateRoutes);
  const server = await startServer(app);
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/api/v1/personalization-templates`;

  for (const method of ["GET", "POST", "PATCH"]) {
    const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: method === "GET" ? undefined : "{}" });
    assert.equal(response.status, 401, `${method} without token`);
  }

  const userToken = jwt.sign({ userId: "user-1", role: "user" }, process.env.JWT_SECRET);
  for (const method of ["GET", "POST", "PATCH"]) {
    const response = await fetch(url, {
      method,
      headers: { cookie: `accessToken=${userToken}`, "content-type": "application/json" },
      body: method === "GET" ? undefined : "{}",
    });
    assert.equal(response.status, 403, `${method} for non-admin user`);
  }
});

test("product detail includes a resolved template only for eligible products", async (t) => {
  withTemplateFindOne(t, activeTemplate);
  const originalFindById = Product.findById;
  const originalFind = Product.find;
  t.after(() => {
    Product.findById = originalFindById;
    Product.find = originalFind;
  });
  let personalizationEnabled = true;
  Product.findById = async () => ({
    _id: "product-1",
    groupId: "CATALOG-GROUP",
    personalizationEnabled,
    personalizationGroupId: "LFC-2627-HOME",
  });
  Product.find = async () => [];

  let response;
  await getProductById(
    { params: { id: "product-1" } },
    { status() { return this; }, json(value) { response = value; return this; } },
    (error) => { throw error; },
  );
  assert.equal(response.personalizationTemplate.groupId, "LFC-2627-HOME");

  personalizationEnabled = false;
  await getProductById(
    { params: { id: "product-1" } },
    { status() { return this; }, json(value) { response = value; return this; } },
    (error) => { throw error; },
  );
  assert.equal(response.personalizationTemplate, null);
});
