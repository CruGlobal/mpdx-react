import {
  isJwtExpired,
  setUserInfo,
  signValue,
  verifySignedValue,
} from './helpers';

describe('isJwtExpired', () => {
  it('returns true for expired JWTs', () => {
    // exp is 1000000000 / 2001-09-09T01:46:40.000Z
    expect(
      isJwtExpired(
        'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEwMDAwMDAwMDB9.h2Qk01iTa6nH_U-OpImeSecS7owIx6YMqeh6yfWO7Xg',
      ),
    ).toBe(true);
  });

  it('returns false for unexpired JWTs', () => {
    // exp is 2000000000 / 2033-05-18T03:33:20.000Z
    expect(
      isJwtExpired(
        'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjIwMDAwMDAwMDB9.XIy4tZ8x7c86GgrOHqwZwR_i28BWxknyjPpHpklBw4U',
      ),
    ).toBe(false);
  });

  it('throws for JWTs without 3 dot-separated sections', () => {
    expect(() => isJwtExpired('malformed')).toThrow();
  });

  it('throws for JWTs without a JSON payload', () => {
    expect(() => isJwtExpired('a.b.c')).toThrow();
  });
});

describe('signValue and verifySignedValue', () => {
  it('signs and verifies a boolean value correctly', () => {
    const signedTrue = signValue(true, 100);
    const signedFalse = signValue(false, 100);

    expect(verifySignedValue(signedTrue)).toBe('true');
    expect(verifySignedValue(signedFalse)).toBe('false');
  });

  it('signs and verifies a string value correctly', () => {
    expect(verifySignedValue(signValue('mpd_leader', 100))).toBe('mpd_leader');
  });

  it('returns null for expired signed values', async () => {
    const signedValue = signValue(true, -1);

    expect(verifySignedValue(signedValue)).toBeNull();
  });

  it('returns null for tampered signed values', () => {
    const signedValue = signValue(true, 100);
    const parts = signedValue.split('.');

    const tamperedSignedValue = `false.${parts[1]}.${parts[2]}`;

    expect(verifySignedValue(tamperedSignedValue)).toBeNull();
  });
});

describe('setUserInfo', () => {
  const impersonateCookies = (impersonatorRoleCookie: string) =>
    `mpdx-handoff.impersonate=impersonate-token; mpdx-handoff.token=impersonator-token; mpdx-handoff.impersonatorRole=${impersonatorRoleCookie}`;

  it('returns the verified impersonator role and expires the cookie', () => {
    const { user, cookies } = setUserInfo(
      'access-token',
      'user-1',
      impersonateCookies(signValue('mpd_leader')),
    );

    expect(user).toMatchObject({
      apiToken: 'impersonate-token',
      impersonating: true,
      impersonatorApiToken: 'impersonator-token',
      impersonatorRole: 'mpd_leader',
    });
    expect(cookies).toContain(
      'mpdx-handoff.impersonatorRole=; HttpOnly; Secure; path=/; Max-Age=0',
    );
  });

  it('drops an impersonator role with a bad signature', () => {
    const [value, expiresAt] = signValue('developer').split('.');

    const { user } = setUserInfo(
      'access-token',
      'user-1',
      impersonateCookies(`${value}.${expiresAt}.bogus-signature`),
    );

    expect(user.impersonating).toBe(true);
    expect(user.impersonatorRole).toBeUndefined();
  });

  it('drops a signed value that is not a known role', () => {
    const { user } = setUserInfo(
      'access-token',
      'user-1',
      impersonateCookies(signValue('bogus')),
    );

    expect(user.impersonatorRole).toBeUndefined();
  });

  it('ignores the impersonator role cookie when not impersonating', () => {
    const { user, cookies } = setUserInfo(
      'access-token',
      'user-1',
      `mpdx-handoff.impersonatorRole=${signValue('developer')}`,
    );

    expect(user).toMatchObject({
      apiToken: 'access-token',
      userID: 'user-1',
      impersonating: false,
    });
    expect(user.impersonatorRole).toBeUndefined();
    expect(cookies).toContain(
      'mpdx-handoff.impersonatorRole=; HttpOnly; Secure; path=/; Max-Age=0',
    );
  });
});
