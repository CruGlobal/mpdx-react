import { createMocks } from 'node-mocks-http';
import { getToken } from 'next-auth/jwt';
import handoff from '../../../pages/api/handoff.page';
import { ssrClient } from 'src/lib/client';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
jest.mock('src/lib/client', () => ({ ssrClient: jest.fn() }));

describe('/api/handoff', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, REWRITE_DOMAIN: 'stage.mpdx.org' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });
  it('returns 302', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handoff(req, res);

    expect(res._getStatusCode()).toBe(302);
  });

  describe('session', () => {
    const defaultAccountList = 'defaultAccountList';
    beforeEach(() => {
      (getToken as jest.Mock).mockReturnValue({
        apiToken: 'accessToken',
        userID: 'sessionUserID',
      });
      (ssrClient as jest.Mock).mockReturnValue({
        query: jest.fn().mockReturnValue({
          data: { user: { defaultAccountList } },
        }),
      });
    });

    describe('Staging env', () => {
      const OLD_ENV = process.env;
      beforeEach(() => {
        jest.resetModules();
        process.env = {
          ...OLD_ENV,
          REWRITE_DOMAIN: 'mpdx.org',
          NODE_ENV: 'development',
        };
      });

      afterAll(() => {
        process.env = OLD_ENV;
      });

      it('returns redirect', async () => {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            accountListId: 'accountListId',
            userId: 'userId',
            path: 'path',
          },
        });
        await handoff(req, res);

        expect(res._getStatusCode()).toBe(302);
        expect(res._getRedirectUrl()).toBe(
          'https://stage.mpdx.org/handoff?accessToken=accessToken&accountListId=accountListId&userId=userId&path=path',
        );
      });

      it('returns redirect but gets session userID', async () => {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            accountListId: 'accountListId',
            userId: '',
            path: 'path',
          },
        });
        await handoff(req, res);

        expect(res._getStatusCode()).toBe(302);
        expect(res._getRedirectUrl()).toBe(
          `https://stage.mpdx.org/handoff?accessToken=accessToken&accountListId=accountListId&userId=sessionUserID&path=path`,
        );
      });

      it('returns redirect but gets defaultAccountList', async () => {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            accountListId: '',
            userId: 'userId',
            path: 'path',
          },
        });
        await handoff(req, res);

        expect(res._getStatusCode()).toBe(302);
        expect(res._getRedirectUrl()).toBe(
          `https://stage.mpdx.org/handoff?accessToken=accessToken&accountListId=${defaultAccountList}&userId=userId&path=path`,
        );
      });

      it('returns redirect but gets first accountList id', async () => {
        (ssrClient as jest.Mock).mockReturnValue({
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
        await handoff(req, res);

        expect(res._getStatusCode()).toBe(302);
        expect(res._getRedirectUrl()).toBe(
          `https://stage.mpdx.org/handoff?accessToken=accessToken&accountListId=accountID&userId=userId&path=path`,
        );
      });

      it('returns redirect for auth', async () => {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            path: 'auth/user/admin',
            auth: 'true',
          },
        });
        await handoff(req, res);

        expect(res._getStatusCode()).toBe(302);
        expect(res._getRedirectUrl()).toBe(
          'https://auth.stage.mpdx.org/auth/user/admin?access_token=accessToken',
        );
      });
    });

    describe('Production env', () => {
      const OLD_ENV = process.env;

      beforeEach(() => {
        jest.resetModules();
        process.env = {
          ...OLD_ENV,
          REWRITE_DOMAIN: 'mpdx.org',
          NODE_ENV: 'production',
        };
      });

      afterAll(() => {
        process.env = OLD_ENV;
      });

      it('returns redirect', async () => {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            accountListId: 'accountListId',
            userId: 'userId',
            path: 'path',
          },
        });
        await handoff(req, res);

        expect(res._getStatusCode()).toBe(302);
        expect(res._getRedirectUrl()).toBe(
          'https://mpdx.org/handoff?accessToken=accessToken&accountListId=accountListId&userId=userId&path=path',
        );
      });

      it('returns redirect for auth', async () => {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            path: 'auth/user/admin',
            auth: 'true',
          },
        });
        await handoff(req, res);

        expect(res._getStatusCode()).toBe(302);
        expect(res._getRedirectUrl()).toBe(
          'https://auth.mpdx.org/auth/user/admin?access_token=accessToken',
        );
      });
    });
  });
});
