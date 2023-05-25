import { createMocks } from 'node-mocks-http';
import { getToken } from 'next-auth/jwt';
import stopImpersonating from '../../../pages/api/stop-impersonating.page';
import { nextAuthSessionCookieName } from 'pages/api/utils/cookies';
import { reportError } from 'pages/api/utils/RollBar';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
const siteUrl = `${process.env.SITE_URL}`;
// User one
const userOneImpersonate = 'userOne.impersonate.token';

const convertCookieStringToObject = (cookieString) => {
  return cookieString.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=');
    prev[name] = value.join('=');
    return prev;
  }, {});
};
interface cookiesType {
  [key: string]: string;
}
interface createMocksRequests {
  req: any;
  res: any;
}

describe('/api/stop-impersonating', () => {
  beforeEach(() => {
    (getToken as jest.Mock).mockReturnValue({
      impersonatorApiToken: userOneImpersonate,
    });

    reportError as jest.Mock;
  });

  it('Ensure Correct cookies are removed or added/edited', async () => {
    const { req, res }: createMocksRequests = createMocks({ method: 'GET' });
    await stopImpersonating(req, res);
    expect(res._getRedirectUrl()).toBe(`${siteUrl}/login`);
    const cookies: cookiesType[] = [];
    res._getHeaders()['set-cookie'].forEach((cookie) => {
      cookies.push(convertCookieStringToObject(cookie));
    });
    expect(cookies.length).toBe(3);
    expect(cookies[0][nextAuthSessionCookieName]).toBe('');
    expect(cookies[0]['Max-Age']).toBe('0');
    expect(cookies[1]['mpdx-handoff.redirect-url']).toBe(`${siteUrl}/`);
    expect(cookies[2]['mpdx-handoff.token']).toBe(userOneImpersonate);
  });
});
