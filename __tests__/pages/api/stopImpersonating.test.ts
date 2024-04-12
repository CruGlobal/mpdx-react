import { getToken } from 'next-auth/jwt';
import { createMocks } from 'node-mocks-http';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import stopImpersonating from '../../../pages/api/stop-impersonating.page';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
jest.mock('src/lib/apollo/ssrClient', () => jest.fn());
// User one
const userOneImpersonate = 'userOne.impersonate.token';

const convertCookieStringToObject = (cookieString) => {
  return cookieString.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=');
    prev[name] = value.join('=');
    return prev;
  }, {});
};
type Cookies = Record<string, string>;

describe('/api/stop-impersonating', () => {
  const defaultAccountList = 'defaultAccountList';
  const OLD_ENV = process.env;
  const siteUrl = 'https://next.mpdx.org';

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
      REWRITE_DOMAIN: 'mpdx.org',
      SITE_URL: siteUrl,
    };
    (getToken as jest.Mock).mockReturnValue({
      impersonatorApiToken: userOneImpersonate,
      apiToken: 'accessToken',
      userID: 'sessionUserID',
    });
    (makeSsrClient as jest.Mock).mockReturnValue({
      query: jest.fn().mockReturnValue({
        data: { user: { defaultAccountList } },
      }),
    });
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('Returns user to home when error', async () => {
    (makeSsrClient as jest.Mock).mockReturnValue({
      query: jest.fn().mockRejectedValueOnce(new Error('An Error Happened')),
    });

    const { req, res } = createMocks({ method: 'GET' });
    await stopImpersonating(req, res);

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe('https://next.mpdx.org/');
  });

  it('Returns user to legacy home when no values sent', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await stopImpersonating(req, res);

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe(
      'https://mpdx.org/handoff?accessToken=accessToken&accountListId=defaultAccountList&userId=sessionUserID&path=',
    );
  });

  it('Ensure Correct cookies are removed or added/edited', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await stopImpersonating(req, res);
    const cookies: Cookies[] = [];
    res._getHeaders()['set-cookie'].forEach((cookie) => {
      cookies.push(convertCookieStringToObject(cookie));
    });
    expect(cookies.length).toBe(4);
    expect(cookies[0]['__Secure-next-auth.session-token']).toBe('');
    expect(cookies[1]['next-auth.session-token']).toBe('');
    expect(cookies[0]['Max-Age']).toBe('0');
    expect(cookies[1]['Max-Age']).toBe('0');
    expect(cookies[2]['mpdx-handoff.redirect-url']).toBe(`${siteUrl}/`);
    expect(cookies[3]['mpdx-handoff.token']).toBe(userOneImpersonate);
  });

  it('Should redirect user to legacy site', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        accountListId: 'accountListId',
        userId: 'userId',
        path: 'path',
      },
    });
    await stopImpersonating(req, res);

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe(
      'https://mpdx.org/handoff?accessToken=accessToken&accountListId=accountListId&userId=userId&path=path',
    );
  });

  it('Redirects user to legacy site using sessionUserID when userId not passed in', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        accountListId: 'accountListId',
        userId: '',
        path: 'path',
      },
    });
    await stopImpersonating(req, res);

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe(
      `https://mpdx.org/handoff?accessToken=accessToken&accountListId=accountListId&userId=sessionUserID&path=path`,
    );
  });

  it('Redirects user to legacy site but gets defaultAccountList', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        accountListId: '',
        userId: 'userId',
        path: 'path',
      },
    });
    await stopImpersonating(req, res);

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe(
      `https://mpdx.org/handoff?accessToken=accessToken&accountListId=${defaultAccountList}&userId=userId&path=path`,
    );
  });

  it('Redirects user to legacy site but gets first accountList id', async () => {
    (makeSsrClient as jest.Mock).mockReturnValue({
      query: jest.fn().mockReturnValue({
        data: {
          user: { defaultAccountList: '' },
          accountLists: { nodes: [{ id: 'accountID' }] },
        },
      }),
    });
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        accountListId: '',
        userId: 'userId',
        path: 'path',
      },
    });
    await stopImpersonating(req, res);

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe(
      `https://mpdx.org/handoff?accessToken=accessToken&accountListId=accountID&userId=userId&path=path`,
    );
  });

  it('Redirect user to auth site', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        path: 'auth/user/admin',
        auth: 'true',
      },
    });
    await stopImpersonating(req, res);

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe(
      'https://auth.mpdx.org/auth/user/admin?access_token=accessToken',
    );
  });
});
