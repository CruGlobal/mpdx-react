import { buildHelpjuiceContactUrl } from './contactUrl';

describe('buildHelpjuiceContactUrl', () => {
  it('adds the name, email, and page url', () => {
    const url = new URL(
      buildHelpjuiceContactUrl({
        contactUrl: 'https://domain.helpjuice.com/contact-us',
        name: 'First Last',
        email: 'first.last@cru.org',
        href: 'https://example.com/accountLists/1?tab=2',
      }),
    );

    expect(url.origin + url.pathname).toBe(
      'https://domain.helpjuice.com/contact-us',
    );
    expect(url.searchParams.get('mpdxName')).toBe('First Last');
    expect(url.searchParams.get('mpdxEmail')).toBe('first.last@cru.org');
    expect(url.searchParams.get('mpdxUrl')).toBe(
      'https://example.com/accountLists/1?tab=2',
    );
  });

  it('omits the name and email when they are missing', () => {
    const url = new URL(
      buildHelpjuiceContactUrl({
        contactUrl: 'https://domain.helpjuice.com/contact-us',
        href: 'https://example.com/',
      }),
    );

    expect(url.searchParams.has('mpdxName')).toBe(false);
    expect(url.searchParams.has('mpdxEmail')).toBe(false);
    expect(url.searchParams.get('mpdxUrl')).toBe('https://example.com/');
  });

  describe('page url', () => {
    const mpdxUrl = (href: string) =>
      new URL(
        buildHelpjuiceContactUrl({
          contactUrl: 'https://domain.helpjuice.com/contact-us',
          href,
        }),
      ).searchParams.get('mpdxUrl');

    it.each([
      'https://mpdx.org/accountLists/abc/tasks',
      'https://stage.mpdx.org/accountLists/abc/tasks?filter=late',
    ])('keeps the full url on a public host: %s', (href) => {
      expect(mpdxUrl(href)).toBe(href);
    });

    it.each([
      [
        'http://localhost:3000/accountLists/abc/tasks?filter=late',
        '/accountLists/abc/tasks?filter=late',
      ],
      [
        'http://127.0.0.1:3000/accountLists/abc/tasks',
        '/accountLists/abc/tasks',
      ],
      ['http://10.0.0.5/accountLists/abc', '/accountLists/abc'],
      ['http://[::1]:3000/accountLists/abc?x=1', '/accountLists/abc?x=1'],
      ['http://mpdx.localhost:3000/accountLists/abc', '/accountLists/abc'],
    ])('sends only the path and query for %s', (href, expected) => {
      expect(mpdxUrl(href)).toBe(expected);
    });

    it.each(['/accountLists/abc/tasks', 'localhost:3000/accountLists/abc'])(
      'passes %s through as it is',
      (href) => {
        expect(mpdxUrl(href)).toBe(href);
      },
    );
  });
});
