import { getToken } from 'next-auth/jwt';
import { createMocks } from 'node-mocks-http';
import mpdxWebHandoff from '../../../pages/api/mpdx-web-handoff.page';
import { taskFiltersTabs } from '../../../src/utils/tasks/taskFilterTabs';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));

const siteUrl = `${process.env.SITE_URL}`;
const accountListsUrl = `${process.env.SITE_URL}/accountLists`;
// User one
const userOneId = 'userId_1';
const userOneToken = 'userOne.token';
const userOneImpersonate = 'userOne.impersonate.token';
// User two
const userTwoId = 'userId_2';
const userTwoToken = 'userTwo.token';
const userTwoImpersonate = 'userTwo.impersonate.token';

const convertCookieStringToObject = (cookieString) => {
  return cookieString.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=');
    prev[name] = value.join('=');
    return prev;
  }, {});
};

const grabCookies = (setCookieHeader: string[]): cookiesType[] => {
  const cookies: cookiesType[] = [];
  setCookieHeader.forEach((cookie) =>
    cookies.push(convertCookieStringToObject(cookie)),
  );
  return cookies;
};

interface cookiesType {
  [key: string]: string;
}

describe('/api/mpdx-web-handoff', () => {
  it('No accountListId or path defined. Redirect to home', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await mpdxWebHandoff(req, res);
    expect(res._getRedirectUrl()).toBe(`${siteUrl}/`);
  });

  const redirectUrl = `${process.env.SITE_URL}/accountLists/accountListId/contacts`;

  describe('No prev session', () => {
    beforeEach(() => {
      (getToken as jest.Mock).mockReturnValue(null);
    });
    it('New user - Redirect to login with correct cookies', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/contacts',
        },
      });
      await mpdxWebHandoff(req, res);
      expect(res._getRedirectUrl()).toBe(`${siteUrl}/login`);
      const cookies = grabCookies(res._getHeaders()['set-cookie']);
      expect(cookies.length).toBe(2);
      expect(cookies[0]['mpdx-handoff.redirect-url']).toBe(redirectUrl);
      expect(cookies[1]['mpdx-handoff.logged-in']).toBe(`true`);
    });

    it('Impersonate user - Redirect to login with correct cookies', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/contacts',
          userId: userOneId,
          token: userOneToken,
          impersonate: userOneImpersonate,
        },
      });
      await mpdxWebHandoff(req, res);
      expect(res._getRedirectUrl()).toBe(`${siteUrl}/login`);
      const cookies = grabCookies(res._getHeaders()['set-cookie']);

      expect(cookies.length).toBe(4);
      expect(cookies[0]['mpdx-handoff.impersonate']).toBe(userOneImpersonate);
      expect(cookies[1]['mpdx-handoff.redirect-url']).toBe(redirectUrl);
      expect(cookies[2]['mpdx-handoff.token']).toBe(userOneToken);
      expect(cookies[3]['mpdx-handoff.logged-in']).toBe(`true`);
    });

    it('No user - Redirect to home', async () => {
      const { req, res } = createMocks({ method: 'GET' });
      await mpdxWebHandoff(req, res);
      expect(res._getRedirectUrl()).toBe(`${siteUrl}/`);
    });
  });

  describe('Has active session', () => {
    beforeEach(() => {
      (getToken as jest.Mock).mockReturnValue({
        apiToken: userOneToken,
        userID: userOneId,
      });
    });

    it('New user - Loggout prev user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/contacts',
          userId: userTwoId,
          token: userTwoToken,
        },
      });
      await mpdxWebHandoff(req, res);
      expect(res._getRedirectUrl()).toBe(
        `${siteUrl}/accountLists/accountListId/contacts`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);

      expect(cookies.length).toBe(5);
      expect(cookies[0]['__Secure-next-auth.session-token']).toBe('');
      expect(cookies[1]['next-auth.session-token']).toBe('');
      expect(cookies[0]['Max-Age']).toBe('0');
      expect(cookies[1]['Max-Age']).toBe('0');
      expect(cookies[2]['mpdx-handoff.accountConflictUserId']).toBe(userTwoId);
      expect(cookies[3]['mpdx-handoff.redirect-url']).toBe(redirectUrl);
      expect(cookies[4]['mpdx-handoff.token']).toBe(userTwoToken);
    });

    it('New user - Same token - Shouldnt remove prev user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/contacts',
          userId: userTwoId,
          token: userOneToken,
        },
      });
      await mpdxWebHandoff(req, res);
      expect(res._getRedirectUrl()).toBe(
        `${siteUrl}/accountLists/accountListId/contacts`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);

      expect(cookies.length).toBe(5);
      expect(cookies[0]['__Secure-next-auth.session-token']).toBe('');
      expect(cookies[1]['next-auth.session-token']).toBe('');
      expect(cookies[0]['Max-Age']).toBe('0');
      expect(cookies[1]['Max-Age']).toBe('0');
      expect(cookies[2]['mpdx-handoff.accountConflictUserId']).toBe(userTwoId);
      expect(cookies[3]['mpdx-handoff.redirect-url']).toBe(redirectUrl);
      expect(cookies[4]['mpdx-handoff.token']).toBe(userOneToken);
    });

    it('Impersonate user - Loggout prev user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/contacts',
          userId: userTwoId,
          token: userTwoToken,
          impersonate: userTwoImpersonate,
        },
      });
      await mpdxWebHandoff(req, res);
      expect(res._getRedirectUrl()).toBe(
        `${siteUrl}/accountLists/accountListId/contacts`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);

      expect(cookies.length).toBe(6);
      expect(cookies[0]['__Secure-next-auth.session-token']).toBe('');
      expect(cookies[1]['next-auth.session-token']).toBe('');
      expect(cookies[0]['Max-Age']).toBe('0');
      expect(cookies[1]['Max-Age']).toBe('0');
      expect(cookies[2]['mpdx-handoff.accountConflictUserId']).toBe(userTwoId);
      expect(cookies[3]['mpdx-handoff.redirect-url']).toBe(redirectUrl);
      expect(cookies[4]['mpdx-handoff.token']).toBe(userTwoToken);
      expect(cookies[5]['mpdx-handoff.impersonate']).toBe(userTwoImpersonate);
    });

    it('New user - Same token - Should logout prev user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/contacts',
          token: userOneToken,
        },
      });
      await mpdxWebHandoff(req, res);
      expect(res._getRedirectUrl()).toBe(
        `${siteUrl}/accountLists/accountListId/contacts`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);
      expect(cookies.length).toBe(0);
    });

    it('Same user - Redirect to contact with url params', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          p1: 'p1',
          p2: 'p2',
          path: '/contacts',
        },
      });
      await mpdxWebHandoff(req, res);

      expect(res._getRedirectUrl()).toBe(
        `${accountListsUrl}/accountListId/contacts?p1=p1&p2=p2&`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);
      expect(cookies.length).toBe(0);
    });
    it('Same user - Redirects to reports', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/reports',
        },
      });
      await mpdxWebHandoff(req, res);

      expect(res._getRedirectUrl()).toBe(
        `${accountListsUrl}/accountListId/reports`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);
      expect(cookies.length).toBe(0);
    });

    it('Same user - Redirects to reports with url params', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          p1: 'p1',
          p2: 'p2',
          path: '/reports',
        },
      });
      await mpdxWebHandoff(req, res);

      expect(res._getRedirectUrl()).toBe(
        `${accountListsUrl}/accountListId/reports?p1=p1&p2=p2&`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);
      expect(cookies.length).toBe(0);
    });
    it('Same user - Redirects with tasks', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/tasks',
        },
      });
      await mpdxWebHandoff(req, res);

      expect(res._getRedirectUrl()).toBe(
        `${accountListsUrl}/accountListId/tasks`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);
      expect(cookies.length).toBe(0);
    });

    it('Same user - Redirects with tasks and group', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          group: 'today',
          path: '/tasks',
        },
      });
      await mpdxWebHandoff(req, res);

      const typeDetails = taskFiltersTabs.find(
        (item) => item.name.toLowerCase() === 'today',
      );

      const filters = `filters=${encodeURIComponent(
        JSON.stringify(typeDetails?.activeFiltersOptions),
      )}`;

      expect(res._getRedirectUrl()).toBe(
        `${accountListsUrl}/accountListId/tasks?${filters}`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);
      expect(cookies.length).toBe(0);
    });

    it('Same user - Redirects with none Contact/Report or Task path', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          modal: 'AddContact',
          path: '/',
        },
      });
      await mpdxWebHandoff(req, res);

      expect(res._getRedirectUrl()).toBe(
        `${accountListsUrl}/accountListId/?modal=AddContact&`,
      );
      const cookies = grabCookies(res._getHeaders()['set-cookie']);
      expect(cookies.length).toBe(0);
    });
  });
});
