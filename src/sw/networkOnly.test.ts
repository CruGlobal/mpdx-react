import { isNetworkOnly } from './networkOnly';

const match = (href: string, mode: RequestMode = 'cors') =>
  isNetworkOnly({ url: new URL(href, 'https://mpdx.org'), request: { mode } });

describe('isNetworkOnly', () => {
  it.each([
    '/api/auth/session',
    '/api/auth/session?update',
    '/api/graphql',
    '/api/graphql-rest',
    '/api/graphql-rest/x',
    '/api/csv-update',
    '/api/uploads/x',
    '/api/auth',
    '/api/auth/callback/okta',
    '/api/helpjuice/x',
    'https://api.mpdx.org/graphql',
    'https://api.stage.mpdx.org/api/v2/user',
    '/_next/data/39rw2o9/accountLists/1/contacts.json?x=1',
  ])('%s is network-only', (href) => expect(match(href)).toBe(true));

  it('treats every navigation as network-only', () =>
    expect(match('/accountLists/1/contacts', 'navigate')).toBe(true));

  it.each([
    '/_next/static/chunks/main.js',
    '/icons/icon-192x192.png',
    '/locales/en/translation.json',
    'https://mpdx.org/apiary',
    'https://notapi.mpdx.org.evil.com/x',
    'https://api.mpdx.org.evil.com/x',
    'https://api.evilmpdx.org/x',
    '/apis/x',
  ])('%s is not network-only', (href) => expect(match(href)).toBe(false));
});
