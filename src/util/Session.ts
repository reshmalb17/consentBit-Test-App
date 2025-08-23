// src/util/session.ts
export function getSessionTokenFromLocalStorage() {
  const userinfo = localStorage.getItem("consentbit-userinfo");
  if (!userinfo) return null;
  try {
    const tokenss = JSON.parse(userinfo);
    return tokenss?.sessionToken || null;
  } catch {
    // Invalid JSON, clear it
    localStorage.removeItem("consentbit-userinfo");
    return null;
  }
}
