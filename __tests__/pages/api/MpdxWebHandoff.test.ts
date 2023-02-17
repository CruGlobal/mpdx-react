import { createMocks } from 'node-mocks-http';
import { getToken } from 'next-auth/jwt';
import mpdxWebHandoff from '../../../pages/api/mpdx-web-handoff.page';
import { taskFiltersTabs } from '../../../src/utils/tasks/taskFilterTabs';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));

const siteUrl = 'http://next-stage.mpdx.org';
const accountListsUrl = 'http://next-stage.mpdx.org/accountLists';

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

describe('/api/mpdx-web-handoff', () => {
  it('No accountListId or path defined. Redirect to home', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await mpdxWebHandoff(req, res);
    expect(res._getRedirectUrl()).toBe(`${siteUrl}/`);
  });

  describe('Inactive session', () => {
    beforeEach(() => {
      (getToken as jest.Mock).mockReturnValue(null);
    });
    it('Redirect to login', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/contacts',
        },
      });
      await mpdxWebHandoff(req, res);

      expect(res._getRedirectUrl()).toBe(`${siteUrl}/login`);
    });

    it('Assigned the correct cookies', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/contacts',
        },
      });
      await mpdxWebHandoff(req, res);

      expect(res._getRedirectUrl()).toBe(`${siteUrl}/login`);
      const cookies: cookiesType[] = [];
      res._getHeaders()['set-cookie'].forEach((cookie) => {
        cookies.push(convertCookieStringToObject(cookie));
      });
      expect(cookies.length).toBe(2);
      expect(cookies[0]['mpdx-handoff.redirect-url']).toBe(
        `${process.env.SITE_URL}/accountLists/accountListId/contacts`,
      );
      expect(cookies[1]['mpdx-handoff.logged-in']).toBe(`true`);
    });
    it('No accountListId or path defined. Redirect to home', async () => {
      const { req, res } = createMocks({ method: 'GET' });
      await mpdxWebHandoff(req, res);
      expect(res._getRedirectUrl()).toBe(`${siteUrl}/`);
    });
  });

  describe('Active session', () => {
    beforeEach(() => {
      (getToken as jest.Mock).mockReturnValue({ apiToken: 'accessToken' });
    });

    it('Redirects with contactId', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          accountListId: 'accountListId',
          path: '/contacts',
        },
      });
      await mpdxWebHandoff(req, res);

      expect(res._getRedirectUrl()).toBe(
        `${accountListsUrl}/accountListId/contacts`,
      );
    });

    it('Redirects with contactId and other url params', async () => {
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
    });
    it('Redirects with reports', async () => {
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
    });

    it('Redirects with reports and other url params', async () => {
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
    });
    it('Redirects with tasks', async () => {
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
    });

    it('Redirects with tasks and group', async () => {
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
    });

    it('Redirects with none Contact/Report or Task path', async () => {
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
    });
  });
});
