export function normalizeApiBase(base) {
  const cleanBase = base.replace(/\/+$/, "");
  if (cleanBase.endsWith("/api/v1")) return cleanBase;
  if (cleanBase.endsWith("/api")) return `${cleanBase}/v1`;
  return cleanBase;
}

export function normalizeApiPath(path) {
  const withoutVersion = path.startsWith("/v1/") ? path.slice(3) : path === "/v1" ? "" : path;
  return withoutVersion && !withoutVersion.startsWith("/") ? `/${withoutVersion}` : withoutVersion;
}
