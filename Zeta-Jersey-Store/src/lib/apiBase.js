export function normalizeApiBase(base) {
  const cleanBase = base.replace(/\/+$/, "");
  if (cleanBase.endsWith("/api/v1")) return cleanBase;
  if (cleanBase.endsWith("/api")) return `${cleanBase}/v1`;
  return cleanBase;
}
