import { isJwtExpired, signValue, verifySignedValue } from './helpers';

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
