export const cookieDefaultInfo = `HttpOnly; path=/; Max-Age=${5 * 60}`;
export const expireCookieDefaultInfo = `HttpOnly; path=/; Max-Age=0`;
export const clearNextAuthSessionCookies = [
  `__Secure-next-auth.session-token=; Secure; ${expireCookieDefaultInfo}`,
  `next-auth.session-token=; ${expireCookieDefaultInfo}`,
];
