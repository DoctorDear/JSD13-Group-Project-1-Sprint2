# R2 image uploads

The admin image upload endpoint stores product and jersey-back images in the Cloudflare R2 bucket zeta-jersey-images. Keep these settings on the backend only:

    R2_ACCOUNT_ID=your-cloudflare-account-id
    R2_BUCKET_NAME=zeta-jersey-images
    R2_PUBLIC_BASE_URL=https://your-public-r2-domain
    R2_ACCESS_KEY_ID=your-r2-access-key-id
    R2_SECRET_ACCESS_KEY=your-r2-secret-access-key

Use the Access Key ID and Secret Access Key shown once when creating an R2 Object Read & Write token limited to this bucket. Put the values in server/.env for local development and in the backend host's environment settings for deployment. Do not add real values to .env.example, frontend variables, source control, or logs. The public URL should be HTTPS and should point to the bucket's enabled public development URL or its custom domain.

For browser uploads, FRONTEND_URL must exactly match the deployed frontend origin, including https:// and any non-default port. Add extra origins as comma-separated values in CORS_ALLOWED_ORIGINS. Local Vite origins are already allowed. Keep browser-facing origins narrow; the server checks the upload Origin and CORS policy.

Uploads use R2 Standard storage and keep original image dimensions. The current r2.dev address is for development; use a custom domain for production image delivery. R2 has no internet egress fee, but storage and operation usage above the monthly included amounts can be billed. Add a Cloudflare budget alert if you want an email when account usage-based charges cross a chosen amount; an alert does not stop requests.

Each upload is limited to one JPEG, PNG, or WebP image up to 5 MiB and 25 megapixels. An authenticated admin can make up to 20 upload requests per minute per running server instance. Use unique generated object keys; removing a product or replacing an image only changes database references. Failed record saves and replaced images may leave objects in R2, so review usage and remove known unused objects manually.
