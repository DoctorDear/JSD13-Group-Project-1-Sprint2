export class R2ConfigurationError extends Error {
  constructor() {
    super("R2 image storage is not configured.");
    this.name = "R2ConfigurationError";
  }
}

export function getR2Config(env = process.env) {
  const accountId = env.R2_ACCOUNT_ID?.trim();
  const bucketName = env.R2_BUCKET_NAME?.trim();
  const publicBaseUrl = env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim();

  if (!accountId || !bucketName || !publicBaseUrl || !accessKeyId || !secretAccessKey) {
    throw new R2ConfigurationError();
  }

  let publicUrl;
  try {
    publicUrl = new URL(publicBaseUrl);
  } catch {
    throw new R2ConfigurationError();
  }
  if (publicUrl.protocol !== "https:") throw new R2ConfigurationError();

  return {
    accountId,
    bucketName,
    publicBaseUrl,
    accessKeyId,
    secretAccessKey,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  };
}
