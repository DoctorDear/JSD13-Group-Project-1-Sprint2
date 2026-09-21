/** Where "Back to website" and post-login redirects send the user. */
export const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://zetajersey.com";

export function goToSite(path = "/") {
  window.location.href = `${SITE_URL.replace(/\/$/, "")}${path}`;
}
