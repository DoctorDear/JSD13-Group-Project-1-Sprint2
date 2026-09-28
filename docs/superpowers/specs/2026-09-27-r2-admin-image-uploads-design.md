# R2 admin image uploads

Date: 2026-09-27
Branch: codex/cloudflare-r2-images
Status: Proposed for written-spec review

## Intent and scope

Allow store administrators to upload product gallery images and jersey back images, store them in Cloudflare R2, and save permanent public URLs in the existing MongoDB fields. Preserve existing external URLs and personalization behavior. The user approved this first-phase scope in chat; this document requires review before implementation planning.

Use the existing Standard bucket `zeta-jersey-images` and public development base URL `https://pub-d33f112eeaf34752872bd58a99901fb1.r2.dev`. This phase does not implement optimization, migrate existing images, create a custom domain, export personalized composites, or delete R2 objects automatically. Public delivery through r2.dev is for development; production delivery and optimization are a separate phase.

## Existing integration points

- Express mounts routes at `/api/v1` in `server/src/server.js`.
- Existing cookie authentication supplies `verifyToken` and `requireAdmin`.
- Product records already store `images: string[]` and `backImageUrl`.
- Personalization templates store their own `backImageUrl`; eligible products use that template image in the SVG preview.
- Inventory currently saves a single image URL and can lose additional gallery entries when editing. Admin normalization must preserve the entire gallery.
- The frontend request helper currently serializes all bodies as JSON and needs FormData support while preserving current JSON behavior and credentials.

## Approach and alternatives

Use a backend-mediated multipart upload: browser -> authenticated Express endpoint -> R2 S3 API -> permanent public URL. This allows byte validation and size enforcement before R2 storage, uses existing backend authorization, and does not require bucket upload CORS.

Direct browser uploads using presigned URLs are a valid alternative for higher traffic but need bucket CORS, upload completion verification, and more endpoints. Cloudflare Images hosted storage is another alternative but changes the selected storage product. Neither is needed for this phase.

The backend handles only bounded image files in memory. Authentication and request-origin checks run before multipart parsing. Existing frontend/backend CORS remains necessary; R2 browser upload CORS is not part of this architecture.

## Upload contract

`POST /api/v1/uploads/images`, multipart/form-data with exactly one `file` and one `purpose` field. Purpose is one of `product`, `product-back`, `template-back`. All purposes require admin authentication. The endpoint does not change product or template records.

Allow JPEG, PNG, and WebP, maximum 5 MiB per file. Enforce multipart limits, validate the actual image format using image metadata parsing, and reject invalid images, animations, or dimensions exceeding 25 million pixels. Do not trust client MIME types or filenames. Use multer for bounded multipart handling, sharp for image metadata validation, and the AWS S3 SDK for R2 storage. Do not resize, crop, or re-encode accepted files in this phase.

Generate keys as `uploads/<purpose>/<uuid>.<verified-extension>`. Never use client filenames as paths. Store verified Content-Type and a long public cache lifetime because uploads always get new keys. Use Standard storage. Apply an upload rate limit of 20 requests per minute per authenticated admin per process; document that it is not an account-wide spending cap. Use express-rate-limit with an authenticated-user key and avoid changing global proxy settings.

Validate Origin against configured frontend origins before accepting cookie-authenticated uploads; reject unapproved origins. Requests without Origin are permitted for authenticated non-browser clients. Restrict upload purposes and file count server-side.

Return HTTP 201 with `{ key, url, contentType, size, width, height }` only after PutObject succeeds. The public URL is built from the configured base URL and encoded key path. It is not a presigned URL and does not expire with the upload token.

Error statuses: 400 missing file or invalid purpose/form; 401 unauthenticated; 403 non-admin or unapproved Origin; 413 file too large; 415 invalid or unsupported image; 429 rate limited; 503 storage not configured or unavailable. Responses must not expose credentials, bucket SDK internals, or raw provider error bodies. Bound upstream time with a 30-second timeout and at most one automatic retry; UI retries are explicit.

## Configuration

Backend-only environment variables: `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Construct the S3 endpoint from the account ID and use region `auto`. Validate nonempty settings and HTTPS public base URL when upload is requested. Missing R2 settings must not prevent unrelated server startup or existing URL workflows.

Document placeholder settings in `server/.env.example`. Never copy actual secrets into tracked files, logs, frontend environment, or test fixtures. Deployment requires the same values in the backend hosting environment.

## Admin experience and persistence

Use a shared upload control with file selection, preview, uploading state, and accessible errors. Preserve manual URL entry for existing external and local images.

Inventory supports an ordered gallery, with the first image acting as the cover. Preserve all existing entries on load/save; allow adding, removing, and moving images up/down. Upload files sequentially, with at most 10 gallery entries. Keep earlier successful uploads if a later file fails and identify the failed file. Do not silently truncate existing records with more than 10 images; preserve them and block adding until below the limit. Disable Save during uploads and preserve fields on failures.

Product back-image and template back-image controls each accept a single image. Upload success fills the existing URL field in the draft. Product/template Save persists those URLs through existing CRUD routes. File inputs must not enter the existing string-only FormData trimming loop.

Removing an image from a draft or replacing a URL changes only references; no R2 deletion occurs because images may be shared. Abandoned drafts or failed database saves can leave unreferenced R2 files. Keep this limitation visible in setup documentation and avoid automatic cleanup without a reference inventory.

## Personalization compatibility

Use the uploaded template back image through the current SVG `<image>` href. Preserve its aspect ratio and existing viewBox/overlay coordinates. Changing the actual source composition can require admin adjustment of template geometry; changing URL alone cannot guarantee alignment. Template back images continue to take precedence over product back images for eligible products. No per-name or per-number bitmap generation is added.

## Verification and acceptance

- Route tests prove unauthenticated/non-admin requests never parse/store uploads, unapproved Origins fail, and configured admins can upload.
- Validate oversize, malformed, unsupported, animated, and excessive-pixel files; assert storage is not called for rejected inputs.
- Storage tests use an injected/mock S3 adapter to assert verified content type, unique keys, permanent URL encoding, bounded failures, and sanitized errors.
- Frontend tests verify JSON requests remain unchanged and FormData gets no manually assigned Content-Type, with credentials retained.
- Gallery tests verify additional existing URLs survive edits, cover/order changes persist, and partial upload failures retain successful entries.
- Run relevant backend and frontend test suites and frontend production build. Inspect admin inventory and template controls in a browser where available.
- With configured credentials and a running backend, smoke-test an actual admin upload, public URL rendering, record save/reload, and template preview. Report separately if a live test cannot run; mocked tests do not prove cloud access.

Success means an admin can upload and save images in both flows without pasting URLs, external URLs remain usable, and the storefront/personalization preview uses the saved R2 URLs. Images are served at their uploaded resolution in this phase.
