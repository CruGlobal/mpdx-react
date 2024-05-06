import { isJwtExpired } from './helpers';

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
