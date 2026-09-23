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
});
