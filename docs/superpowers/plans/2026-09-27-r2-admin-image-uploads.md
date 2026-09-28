# R2 Admin Image Uploads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins upload product gallery and jersey-back images to R2, then save stable public URLs in the existing product and personalization template records.

**Architecture:** The admin sends one bounded multipart upload at a time to an authenticated Express endpoint. The backend validates it and writes it to the existing R2 bucket through the S3-compatible API, then returns a permanent public URL; existing product and template CRUD endpoints persist those URLs. Existing external image URLs continue to work.

**Tech Stack:** Node.js ES modules, Express 5, multer, sharp, AWS SDK for JavaScript v3 S3 client, express-rate-limit, React, existing admin APIs and MongoDB models.

**Spec:** `docs/superpowers/specs/2026-09-27-r2-admin-image-uploads-design.md`

## Global Constraints

- Bucket: `zeta-jersey-images`, Standard storage, development delivery base `https://pub-d33f112eeaf34752872bd58a99901fb1.r2.dev`.
- Accept one JPEG, PNG, or WebP at a time, maximum 5 MiB and 25 million pixels; reject animation and validate actual content rather than trusting filename/MIME.
- Purpose must be `product`, `product-back`, or `template-back`; keys use `uploads/<purpose>/<uuid>.<verified-extension>`.
- All uploads require `verifyToken` and `requireAdmin`; approved frontend Origin is checked before multipart parsing.
- Do not put R2 credentials in frontend code, tracked files, fixtures, or logs. Missing R2 settings must not stop unrelated server startup.
- Keep uploads at original dimensions; do not migrate existing assets or delete R2 objects in this phase.
- Product gallery supports at most 10 images, while existing galleries above 10 must remain intact and block additional uploads until reduced.
- Template back-image remains the preview source for eligible products; preserve image proportions and current template geometry.

## Review Focus

- Forged Content-Type or extension with non-image bytes must fail before storage; pin to Task 2.
- Invalid, huge, or animated images must fail without exhausting memory or writing objects; pin to Task 2.
- A valid user session without the admin role, or an unapproved browser Origin, must never reach storage; pin to Task 2.
- Replacing/removing an image can orphan an R2 object, and gallery edits must not discard existing references; document the former in Task 1 and pin the latter to Task 4.
- Frontend JSON calls must keep their current headers and behavior when multipart support is introduced; pin to Task 3.

---

### Task 1: Configure R2 storage adapter and backend environment

**Files:**
- Modify: `server/package.json`
- Modify: `server/.env.example`
- Create: `server/src/services/r2Storage.js`
- Create: `server/src/config/r2.js`
- Create: `server/doc/R2_IMAGE_UPLOADS.md`

**Interfaces:**
- `getR2Config(env = process.env)` returns `{ accountId, bucketName, publicBaseUrl, accessKeyId, secretAccessKey, endpoint }` or a typed configuration error; endpoint is `https://<accountId>.r2.cloudflarestorage.com`.
- `putImageObject({ key, body, contentType, contentLength })` uploads with S3 SDK region `auto`, configured bucket, `ContentType`, `ContentLength`, and `CacheControl: "public, max-age=31536000, immutable"`.
- `buildPublicImageUrl(key, publicBaseUrl)` encodes individual key segments while retaining `/` separators.
- Upload module initialization is lazy so absent R2 environment values do not break server startup.

- [ ] Add the four runtime packages: `@aws-sdk/client-s3`, `multer`, `sharp`, and `express-rate-limit`; update the server lockfile using the existing package manager.
- [ ] Add five backend-only placeholder variables to `server/.env.example`: `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY`; document the actual Cloudflare dashboard values and Render placement in `server/doc/R2_IMAGE_UPLOADS.md` without real secrets.
- [ ] Implement lazy config validation and an injectable S3 client factory in `server/src/config/r2.js` and `server/src/services/r2Storage.js`; do not emit secret-bearing SDK errors to logs or responses.
- [ ] Document that the current r2.dev URL is for development, direct R2 egress is free, object operation/storage quotas are metered, rate limiting is per server process, and failed database saves may leave unreferenced objects.
- [ ] Review that `.env` files stay ignored and that only the example file and documentation enter the change.

### Task 2: Add authenticated image-upload endpoint

**Files:**
- Create: `server/src/middlewares/imageUpload.middleware.js`
- Create: `server/src/controllers/imageUpload.controller.js`
- Create: `server/src/routes/v1/upload.routes.js`
- Modify: `server/src/routes/v1/index.js`
- Modify: `server/src/server.js` only if a focused error handler is needed for multipart and provider failures.

**Interfaces:**
- `POST /api/v1/uploads/images`, multipart fields `file` and `purpose`; exactly one file.
- Success response: `{ key, url, contentType, size, width, height }`, HTTP 201.
- Allowed `purpose`: `product`, `product-back`, `template-back`.
- Error mapping: malformed request/purpose 400; missing auth 401; non-admin or rejected Origin 403; too large 413; unsupported/invalid image 415; rate limit 429; R2 missing/unavailable 503.

- [ ] Add a route ordered as `verifyToken`, `requireAdmin`, frontend-Origin validation, per-admin 20 requests/minute limiter, bounded multer memory parser (one file, 5 MiB), then controller. Permit missing Origin for authenticated non-browser clients.
- [ ] Validate purpose against the three allowed values. Use sharp metadata to determine real file format and dimensions; accept JPEG, PNG, WebP only, reject animation and more than 25,000,000 pixels. Reject zero-byte and malformed files. Do not trust client filename or MIME.
- [ ] Generate `uploads/<purpose>/<uuid>.<verified-extension>` keys; pass the validated bytes, verified content type, and byte size to `putImageObject`; return the encoded permanent URL only after storage succeeds.
- [ ] Map known parsing, validation, throttling, configuration, timeout, and provider errors to the contract statuses without returning raw provider details or credentials. Bound storage request time to 30 seconds and retry once at most.
- [ ] Ensure the rate-limit key is authenticated user ID (with a stable fallback), never an untrusted forwarded header; leave global proxy trust unchanged.
- [ ] Add the endpoint to the v1 router and check it does not shadow current routes.

### Task 3: Add multipart support to the frontend API layer

**Files:**
- Modify: `Zeta-Jersey-Store/src/lib/api.js`
- Modify: `Zeta-Jersey-Store/src/services/adminService.js`

**Interfaces:**
- `request(path, { method, body, signal, headers })` accepts JSON objects or `FormData`.
- `adminService.uploadImage(file, purpose, options)` sends one `file` and `purpose` to `/uploads/images` using credentials; returns the parsed upload response.

- [ ] Detect `FormData` in `request`; omit `Content-Type` so the browser supplies the multipart boundary, while retaining `Accept`, `credentials: "include"`, error parsing, and current JSON serialization for existing callers.
- [ ] Add `uploadImage(file, purpose, options)` to `adminService` and construct the multipart fields explicitly.
- [ ] Confirm current API calls still take the JSON path and multipart calls preserve cookie credentials and abort signals.

### Task 4: Support complete product galleries and R2 uploads in inventory

**Files:**
- Modify: `Zeta-Jersey-Store/src/admin/useAdminStore.js`
- Modify: `Zeta-Jersey-Store/src/admin/Inventory.jsx`
- Modify: focused inventory form component if extracted from `Inventory.jsx` to keep upload behavior isolated.

**Interfaces:**
- Admin product normalization preserves `images` as an ordered array and exposes `imageUrl` as its first entry for existing summaries.
- Inventory draft stores the full ordered image URL list; first entry is cover.
- `adminService.uploadImage(file, "product")` supplies each uploaded gallery URL.

- [ ] Normalize products without dropping later gallery entries and initialize edit drafts from every existing image URL.
- [ ] Replace the single-image-only inventory form behavior with an ordered gallery control supporting upload, manual external URL entry, removal, and move up/down. Show thumbnails, cover designation, per-file progress/error, and a maximum of 10 new total images.
- [ ] Preserve records that already exceed 10 entries; prohibit additions until fewer than 10 remain instead of truncating existing data.
- [ ] Upload selected files sequentially, preserve successful results after an individual failure, and leave all draft fields intact. Never include the file input in the current string trim loop.
- [ ] On product Save persist the entire `images` array. Product back-image input accepts a manual URL or one `product-back` upload, placing its returned URL in the existing `backImageUrl` field.
- [ ] Disable Save during pending uploads and ensure removal/replacement affects database references only, never deletes R2 objects.

### Task 5: Add R2 upload to personalization template back-image editor

**Files:**
- Modify: `Zeta-Jersey-Store/src/admin/PersonalizationTemplates.jsx`
- Modify: `Zeta-Jersey-Store/src/admin` shared upload control if introduced in Task 4.

**Interfaces:**
- Template draft continues using `backImageUrl`, `viewBox`, name/number styles, and sleeve-badge geometry.
- Back-image upload uses `adminService.uploadImage(file, "template-back")`; existing template Save persists the returned URL.

- [ ] Add file selection, preview, loading, and accessible error handling beside the existing back image URL control; keep manual URL entry.
- [ ] Keep the current preview and geometry controls driven by the draft URL; do not crop or resize the uploaded file.
- [ ] Save the URL using current create/update template APIs. On upload or save errors preserve the URL draft and geometry settings.
- [ ] Check existing eligible-product preview continues to resolve the template back image and layers personalization text over it.

### Task 6: Integrate, validate, and hand off

**Files:**
- Review changed files from Tasks 1-5.
- Modify: `server/doc/R2_IMAGE_UPLOADS.md` if the final UI or deployment setup requires clarifying operational steps.

- [ ] Run focused backend and frontend suites that cover upload authorization, validation, storage outcomes, multipart request construction, full-gallery preservation, partial upload failure, and template draft behavior.
- [ ] Run existing server tests, client tests, and client production build; resolve regressions within this feature scope.
- [ ] If credentials and reachable backend are configured, upload a sample as admin, open the public URL, save/reload it on a product and template, and inspect the personalization preview. If a live R2 test cannot run, state that mock checks do not establish cloud access.
- [ ] Review the branch diff for accidental `.env`/secret changes, leaked provider details, unsafe original filenames, URL encoding errors, and lossy gallery saves.
- [ ] Summarize changed behavior, checks run, deployment environment values needed, and the remaining development-domain/optimization limitation.
