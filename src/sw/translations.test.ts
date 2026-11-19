import { isNetworkOnly } from './networkOnly';
import { isTranslationFile } from './translations';

const match = (href: string) => {
  const url = new URL(href, 'https://mpdx.org');
  return isTranslationFile({
    url,
    sameOrigin: url.origin === 'https://mpdx.org',
  });
};

describe('isTranslationFile', () => {
  it.each([
    '/locales/en/translation.json',
    '/locales/de/translation.json',
    '/locales/fr-CA/translation.json',
    '/locales/zh-Hans-CN/translation.json',
  ])('%s is a translation file', (href) => expect(match(href)).toBe(true));

  it.each([
    '/locales/en/translation_old.json',
    '/locales/translation.json',
    '/locales/en/x/translation.json',
    '/locales/en/translation.json/x',
    '/x/locales/en/translation.json',
    'https://evil.com/locales/en/translation.json',
  ])('%s is not a translation file', (href) => expect(match(href)).toBe(false));

  it.each([
    '/api/auth/session',
    '/api/graphql',
    'https://api.mpdx.org/graphql',
    '/_next/data/39rw2o9/accountLists/1/contacts.json',
  ])('does not match network-only %s', (href) =>
    expect(match(href)).toBe(false),
  );

  // The network-only rule runs first, so it still wins for a page load
  it('leaves a page load of a translation URL network-only', () => {
    const url = new URL('/locales/en/translation.json', 'https://mpdx.org');
    expect(isNetworkOnly({ url, request: { mode: 'navigate' } })).toBe(true);
  });
});
