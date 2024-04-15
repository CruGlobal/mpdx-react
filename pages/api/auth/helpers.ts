import { DateTime } from 'luxon';
import { extractCookie } from 'src/lib/extractCookie';
import { expireCookieDefaultInfo } from '../utils/cookies';

interface User {
  apiToken?: string;
  userID?: string;
  impersonating?: boolean;
  impersonatorApiToken?: string;
}
interface SetUserInfoReturn {
  user: User;
  cookies: string[];
}

export const setUserInfo = (
  access_token: string,
  userId: string,
  reqCookies: string | undefined,
): SetUserInfoReturn => {
  const impersonateJWT = extractCookie(reqCookies, 'mpdx-handoff.impersonate');
  const impersonateUserId = extractCookie(
    reqCookies,
    'mpdx-handoff.accountConflictUserId',
  );
  const token = extractCookie(reqCookies, 'mpdx-handoff.token');

  const user: User = {};

  user.apiToken = impersonateJWT || token || access_token;
  user.userID = impersonateUserId || userId;
  user.impersonating = !!impersonateJWT;
  user.impersonatorApiToken = impersonateJWT ? token || access_token : '';

  const cookies: string[] = [];
  if (impersonateJWT) {
    cookies.push(`mpdx-handoff.impersonate=; ${expireCookieDefaultInfo}`);
  }
  if (impersonateUserId) {
    cookies.push(
      `mpdx-handoff.accountConflictUserId=; ${expireCookieDefaultInfo}`,
    );
  }
  if (token) {
    cookies.push(`mpdx-handoff.token=; ${expireCookieDefaultInfo}`);
  }
  return {
    user,
    cookies,
  };
};

// Determinate whether a JWT is expired without validating its signature
export const isJwtExpired = (jwt: string): boolean => {
  try {
    const decoded = Buffer.from(jwt.split('.')[1], 'base64').toString();
    const payload = JSON.parse(decoded);
    const now = DateTime.now().toSeconds();
    return payload.exp <= now;
  } catch {
    throw new Error('Malformed API token');
  }
};
