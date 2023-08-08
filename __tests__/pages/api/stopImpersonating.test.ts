import { createMocks } from 'node-mocks-http';
import { getToken } from 'next-auth/jwt';
import stopImpersonating from '../../../pages/api/stop-impersonating.page';

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

describe('/api/stop-impersonating', () => {
  beforeEach(() => {
    (getToken as jest.Mock).mockReturnValue({
      impersonatorApiToken: userOneImpersonate,
    });
  });

  it('Ensure Correct cookies are removed or added/edited', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await stopImpersonating(req, res);
    const cookies: cookiesType[] = [];
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
});
