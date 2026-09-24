export function authUserFromResponse(response) {
  const user = response?.user ?? response?.data ?? response;
  if (!user || typeof user !== "object" || Array.isArray(user)) return null;

  const id = user._id ?? user.id;
  if (typeof id !== "string" || !id || typeof user.email !== "string" || !user.email) {
    return null;
  }

  return user;
}
