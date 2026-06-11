import {
  allowedDeepLinkHosts,
  deepLinkFromUrl,
  routeFromPushData,
  sanitizeDeepLinkPath,
} from './deepLink';

describe('deepLink', () => {
  describe('sanitizeDeepLinkPath', () => {
    it.each([
      ['/accountLists', '/accountLists'],
      [
        '/accountLists/al-1/contacts/c-1?tab=Donations',
        '/accountLists/al-1/contacts/c-1?tab=Donations',
      ],
      // query and hash are preserved as-is
      ['/accountLists/al-1?tab=Notes#section', '/accountLists/al-1?tab=Notes#section'],
      ['/', '/'],
    ])('accepts %s', (input, expected) => {
      expect(sanitizeDeepLinkPath(input)).toBe(expected);
    });

    it.each([
      [null],
      [undefined],
      [42],
      [{}],
      [['/accountLists']],
      [true],
    ])('rejects non-string %p', (input) => {
      expect(sanitizeDeepLinkPath(input)).toBeNull();
    });

    it.each([
      // empty
      [''],
      // missing leading slash
      ['contacts/1'],
      // protocol-relative — would navigate off-origin
      ['//evil.com/x'],
      // backslash tricks — browsers treat \ as /
      ['/\\evil.com'],
      ['\\\\evil.com'],
      // absolute URLs / schemes
      ['https://mpdx.org/x'],
      ['http://mpdx.org/x'],
      ['javascript:alert(1)'],
      ['mpdx://accountLists'],
      // whitespace
      ['/a b'],
      ['/a\tb'],
      // does not decode cleanly
      ['/%'],
    ])('rejects %s', (input) => {
      expect(sanitizeDeepLinkPath(input)).toBeNull();
    });
  });

  describe('deepLinkFromUrl', () => {
    const allowedHosts = ['mpdx.org'];

    it('strips an allowed-host https URL back to path + query', () => {
      expect(
        deepLinkFromUrl(
          'https://mpdx.org/accountLists/a/contacts/c?tab=Donations',
          allowedHosts,
        ),
      ).toBe('/accountLists/a/contacts/c?tab=Donations');
    });

    it('preserves the hash fragment', () => {
      expect(
        deepLinkFromUrl('https://mpdx.org/accountLists/a#frag', allowedHosts),
      ).toBe('/accountLists/a#frag');
    });

    it('returns / for a bare allowed-host URL', () => {
      expect(deepLinkFromUrl('https://mpdx.org', allowedHosts)).toBe('/');
    });

    it.each([
      // disallowed host
      ['https://other.org/accountLists/a'],
      // suffix lookalikes — host match must be exact, not endsWith
      ['https://evilmpdx.org/accountLists/a'],
      ['https://mpdx.org.evil.com/accountLists/a'],
      // subdomain is not the allowed host
      ['https://www.mpdx.org/accountLists/a'],
      // port mismatch is a different host
      ['https://mpdx.org:8443/accountLists/a'],
      // http on an allowed host — https only
      ['http://mpdx.org/accountLists/a'],
      // custom schemes are not this module's job
      ['mpdx://accountLists/a'],
      ['javascript:alert(1)'],
      // malformed URL must not throw
      ['not a url'],
      [''],
    ])('returns null for %s', (url) => {
      expect(deepLinkFromUrl(url, allowedHosts)).toBeNull();
    });

    it('matches any host in the allowlist', () => {
      expect(
        deepLinkFromUrl('https://stage.mpdx.org/accountLists/a', [
          'mpdx.org',
          'stage.mpdx.org',
        ]),
      ).toBe('/accountLists/a');
    });
  });

  describe('routeFromPushData', () => {
    it('returns the sanitized deepLink path', () => {
      expect(routeFromPushData({ deepLink: '/accountLists/a' })).toBe(
        '/accountLists/a',
      );
    });

    it('ignores extra keys in the payload', () => {
      expect(
        routeFromPushData({
          deepLink: '/accountLists/a/contacts/c?tab=Donations',
          contact_url: 'https://mpdx.org/contacts/c',
          account_list_id: 'a',
          message: 'You received a gift',
        }),
      ).toBe('/accountLists/a/contacts/c?tab=Donations');
    });

    it.each([
      // missing deepLink
      [{}],
      [{ route: '/accountLists/a' }],
      // invalid deepLink values
      [{ deepLink: '//evil.com/x' }],
      [{ deepLink: 'https://evil.com/x' }],
      [{ deepLink: 42 }],
      [{ deepLink: null }],
      [{ deepLink: '' }],
      // non-object data
      [null],
      [undefined],
      ['/accountLists/a'],
      [42],
    ])('falls back to /accountLists for %p', (data) => {
      expect(routeFromPushData(data)).toBe('/accountLists');
    });
  });

  describe('allowedDeepLinkHosts', () => {
    it('allows the current origin host', () => {
      expect(allowedDeepLinkHosts()).toEqual([window.location.host]);
    });
  });
});
