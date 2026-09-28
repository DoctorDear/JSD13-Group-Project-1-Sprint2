export function loginReturnPath(location) {
  const path = typeof location === "string"
    ? location
    : `${location?.pathname ?? ""}${location?.search ?? ""}${location?.hash ?? ""}`;
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}
