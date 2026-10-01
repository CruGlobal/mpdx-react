import {
  isJwtExpired,
  requiresHcmReLogin,
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

// MPDX-10086: API tokens minted before HCM go-live (2026-09-28T15:00:00Z) belong to sessions whose
// login never copied the HCM person number, so those users must sign in once more.
describe('requiresHcmReLogin', () => {
  // exp is 1793199540 / 2026-10-28T14:59:00Z, so minted 2026-09-28T14:59:00Z
  const mintedBeforeGoLive =
    'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidSIsImV4cCI6MTc5MzE5OTU0MH0.sig';
  // exp is 1793199660 / 2026-10-28T15:01:00Z, so minted 2026-09-28T15:01:00Z
  const mintedAfterGoLive =
    'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidSIsImV4cCI6MTc5MzE5OTY2MH0.sig';
  // exp is 1790879400 / 2026-10-01T18:30:00Z, a 20-minute impersonation token
  const impersonationToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidSIsImV4cCI6MTc5MDg3OTQwMH0.sig';

  it('returns true for a token minted before go-live', () => {
    expect(requiresHcmReLogin(mintedBeforeGoLive, false)).toBe(true);
  });

  it('returns false for a token minted after go-live', () => {
    expect(requiresHcmReLogin(mintedAfterGoLive, false)).toBe(false);
  });

  it('returns false for an impersonation session', () => {
    expect(requiresHcmReLogin(impersonationToken, true)).toBe(false);
  });

  it('throws for JWTs without a JSON payload', () => {
    expect(() => requiresHcmReLogin('a.b.c', false)).toThrow();
  });
});

describe('signValue and verifySignedValue', () => {
  it('signs and verifies a boolean value correctly', () => {
    const signedTrue = signValue(true, 100);
    const signedFalse = signValue(false, 100);

    expect(verifySignedValue(signedTrue)).toBe('true');
    expect(verifySignedValue(signedFalse)).toBe('false');
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
