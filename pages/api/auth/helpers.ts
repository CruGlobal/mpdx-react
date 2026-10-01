import { createHmac, timingSafeEqual } from 'crypto';
import { DateTime } from 'luxon';
import { extractCookie } from 'src/lib/extractCookie';
import { expireCookieDefaultInfo } from '../utils/cookies';

interface User {
  apiToken?: string;
  userID?: string;
  impersonating?: boolean;
  impersonatorApiToken?: string;
  isImpersonatorDeveloper?: boolean;
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

  const isImpersonatorDeveloperSigned = extractCookie(
    reqCookies,
    'mpdx-handoff.isImpersonatorDeveloper',
  );

  if (impersonateJWT && isImpersonatorDeveloperSigned) {
    const unsignedDeveloperValue = verifySignedValue(
      isImpersonatorDeveloperSigned,
    );
    user.isImpersonatorDeveloper = unsignedDeveloperValue === 'true';
  }

  const cookies: string[] = [];
  if (impersonateJWT) {
    cookies.push(`mpdx-handoff.impersonate=; ${expireCookieDefaultInfo}`);
  }
  if (impersonateUserId) {
    cookies.push(
      `mpdx-handoff.accountConflictUserId=; ${expireCookieDefaultInfo}`,
    );
  }
  if (isImpersonatorDeveloperSigned) {
    cookies.push(
      `mpdx-handoff.isImpersonatorDeveloper=; ${expireCookieDefaultInfo}`,
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

/* Sign a boolean with an expiration time */
export function signValue(input: boolean, expiresInSeconds = 300): string {
  const value = input.toString();
  const signatureExpiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${value}.${signatureExpiresAt}`;

  const signature = createHmac('sha256', process.env.JWT_SECRET || '')
    .update(payload)
    .digest('base64');
  return `${payload}.${signature}`;
}

export function verifySignedValue(signedValue: string): string | null {
  try {
    const parts = signedValue.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const [value, expiresAt, providedSignature] = parts;
    const nowInSeconds = Math.floor(Date.now() / 1000);

    const expiresAtParsed = parseInt(expiresAt, 10);
    if (!Number.isInteger(expiresAtParsed)) {
      return null;
    }

    if (expiresAtParsed < nowInSeconds) {
      return null;
    }

    const expectedSignature = createHmac('sha256', process.env.JWT_SECRET || '')
      .update(`${value}.${expiresAt}`)
      .digest('base64');

    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length) {
      return null;
    }
    if (timingSafeEqual(providedBuffer, expectedBuffer)) {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

// Read a JWT's exp without validating its signature
const jwtExp = (jwt: string): number => {
  try {
    const decoded = Buffer.from(jwt.split('.')[1], 'base64').toString();
    return JSON.parse(decoded).exp;
  } catch {
    throw new Error('Malformed API token');
  }
};

// Determinate whether a JWT is expired without validating its signature
export const isJwtExpired = (jwt: string): boolean =>
  jwtExp(jwt) <= DateTime.now().toSeconds();

// The API mints exp as the issue time plus 30 days and carries no iat, so the issue time is derived.
const API_TOKEN_LIFETIME_SECONDS = 30 * 24 * 60 * 60;
// Login copies the HCM person number from Okta only for tokens minted after this. The last token
// minted before it expires at 2026-10-28T15:00:00Z; after that this check never fires and it can be
// deleted along with its caller in the session callback.
const HCM_GO_LIVE_SECONDS = DateTime.fromISO(
  '2026-09-28T15:00:00Z',
).toSeconds();

// Whether a session must sign in once more so login can copy the user's HCM person number.
// Impersonation tokens live minutes, not 30 days, so their derived issue time means nothing.
export const requiresHcmReLogin = (
  jwt: string,
  impersonating: boolean | undefined,
): boolean => {
  if (impersonating) {
    return false;
  }

  return jwtExp(jwt) - API_TOKEN_LIFETIME_SECONDS < HCM_GO_LIVE_SECONDS;
};
