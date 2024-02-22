import { extractCookie } from './extractCookie';

const requestCookies = 'cookieOne=cookieOneValue;cookieTwo=cookieTwoValue;';

describe('extractCookie', () => {
  describe('Should return undefined', () => {
    it('returns undefined when no cookies', () => {
      const cookie = extractCookie('', 'cookieOne');
      expect(cookie).toBeUndefined();
    });

    it('returns undefined when cookie is not present', () => {
      const cookie = extractCookie(requestCookies, 'cookieThree');
      expect(cookie).toBeUndefined();
    });
  });
  describe('Should return cookie value', () => {
    it('returns cookie', () => {
      const cookie = extractCookie(requestCookies, 'cookieOne');
      expect(cookie).toEqual('cookieOneValue');
      const cookieTwo = extractCookie(requestCookies, 'cookieTwo');
      expect(cookieTwo).toEqual('cookieTwoValue');
    });
  });
});
