export const cookieDefaultInfo = `HttpOnly; path=/; Max-Age=${5 * 60}`;
export const expireCookieDefaultInfo = `HttpOnly; path=/; Max-Age=0`;

const isProd = process.env.NODE_ENV === 'production';
export const nextAuthSessionCookieName = isProd
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';
export const nextAuthSessionCookie = `${nextAuthSessionCookieName}=; ${
  isProd ? 'Secure; ' : ''
}${expireCookieDefaultInfo}`;
