import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import {
  blockImpersonatingNonDevelopers,
  dashboardRedirect,
  enforceAdmin,
  ensureSessionAndAccountList,
  loginRedirect,
  makeGetServerSideProps,
  verifyPermission,
} from './pagePropsHelpers';

jest.mock('next-auth/react');
jest.mock('src/lib/apollo/ssrClient', () => jest.fn());

const context = {
  query: { accountListId: 'account-list-1' },
  resolvedUrl: '/page?param=value',
} as unknown as GetServerSidePropsContext;

const mockQueryFactory = (type: string, permission: boolean) => {
  return jest.fn().mockResolvedValue({
    data: {
      user: {
        [type]: permission,
      },
    },
  });
};

describe('pagePropsHelpers', () => {
  describe('loginRedirect', () => {
    it('returns redirect with current URL', () => {
      expect(loginRedirect(context)).toEqual({
        redirect: {
          destination: '/login?redirect=%2Fpage%3Fparam%3Dvalue',
          permanent: false,
        },
      });
    });

    it("doesn't redirect to logout", () => {
      expect(loginRedirect({ ...context, resolvedUrl: '/logout' })).toEqual({
        redirect: {
          destination: '/login',
          permanent: false,
        },
      });
    });
  });

  describe('dashboardRedirect', () => {
    it('returns redirect to dashboard page with reason', () => {
      expect(dashboardRedirect(context, 'unauthorized')).toEqual({
        redirect: {
          destination: '/accountLists/account-list-1?redirect=unauthorized',
          permanent: false,
        },
      });
    });
  });

  describe('enforceAdmin', () => {
    it('redirects when token says user is not admin', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { admin: false, apiToken: 'token' },
      });

      await expect(enforceAdmin(context)).resolves.toMatchObject({
        redirect: {
          destination: '/accountLists/account-list-1?redirect=unauthorized',
        },
      });
    });

    it('allows access when token says admin and API confirms admin', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { admin: true, apiToken: 'token' },
      });
      const query = mockQueryFactory('admin', true);
      (makeSsrClient as jest.Mock).mockReturnValue({ query });

      await expect(enforceAdmin(context)).resolves.toMatchObject({
        props: {
          session: { user: { admin: true, apiToken: 'token' } },
        },
      });
      expect(query).toHaveBeenCalled();
    });

    it('redirects when token says admin but API says not admin', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { admin: true, apiToken: 'token' },
      });
      const query = mockQueryFactory('admin', false);
      (makeSsrClient as jest.Mock).mockReturnValue({ query });

      await expect(enforceAdmin(context)).resolves.toMatchObject({
        redirect: {
          destination: '/accountLists/account-list-1?redirect=unauthorized',
        },
      });
      expect(query).toHaveBeenCalled();
    });

    it('redirects when API returns null user', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: { admin: true, apiToken: 'token' },
      });
      const query = jest.fn().mockResolvedValue({ data: { user: null } });
      (makeSsrClient as jest.Mock).mockReturnValue({ query });

      await expect(enforceAdmin(context)).resolves.toMatchObject({
        redirect: {
          destination: '/accountLists/account-list-1?redirect=unauthorized',
        },
      });
    });
  });

  describe('ensureSessionAndAccountList', () => {
    it('does not return a redirect if the user is logged in', async () => {
      const user = { apiToken: 'token' };
      (getSession as jest.Mock).mockResolvedValue({ user });

      await expect(ensureSessionAndAccountList(context)).resolves.toMatchObject(
        {
          props: {
            session: { user },
          },
        },
      );
    });

    it('returns a redirect if the user is not logged in', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      await expect(ensureSessionAndAccountList(context)).resolves.toMatchObject(
        {
          redirect: {
            destination: '/login?redirect=%2Fpage%3Fparam%3Dvalue',
          },
        },
      );
    });

    describe('redirects to the default account list if the URL contains "_"', () => {
      const context = {
        resolvedUrl: '/accountLists/_/contacts',
      } as unknown as GetServerSidePropsContext;

      beforeEach(() => {
        const user = { apiToken: 'token' };
        (getSession as jest.Mock).mockResolvedValue({ user });
        const query = jest.fn().mockResolvedValueOnce({
          data: {
            user: {
              defaultAccountList: 'defaultAccountList',
            },
          },
        });
        (makeSsrClient as jest.Mock).mockReturnValue({
          query: query,
        });
      });

      it('redirects to the contacts page with default account list', async () => {
        await expect(
          ensureSessionAndAccountList(context),
        ).resolves.toMatchObject({
          redirect: {
            destination: '/accountLists/defaultAccountList/contacts',
          },
        });
      });

      it('redirects to dashboard with default account list"', async () => {
        await expect(
          ensureSessionAndAccountList({
            resolvedUrl: '/accountLists/_',
          } as unknown as GetServerSidePropsContext),
        ).resolves.toMatchObject({
          redirect: {
            destination: '/accountLists/defaultAccountList',
          },
        });
      });
    });
  });

  describe('blockImpersonatingNonDevelopers', () => {
    it('redirects to home page if impersonating and not a developer', async () => {
      const user = { apiToken: 'token', impersonating: true, developer: false };
      (getSession as jest.Mock).mockResolvedValue({ user });
      const query = mockQueryFactory('developer', false);
      (makeSsrClient as jest.Mock).mockReturnValue({ query });

      await expect(
        blockImpersonatingNonDevelopers(context),
      ).resolves.toMatchObject({
        redirect: {
          destination:
            '/accountLists/account-list-1?redirect=impersonation_blocked',
          permanent: false,
        },
      });
    });

    it('allows access if user is not impersonating', async () => {
      const user = {
        apiToken: 'token',
        impersonating: false,
        developer: false,
      };
      (getSession as jest.Mock).mockResolvedValue({ user });

      await expect(
        blockImpersonatingNonDevelopers(context),
      ).resolves.toMatchObject({
        props: {
          session: { user },
        },
      });
    });

    it('allows access if user  is impersonating and is a developer', async () => {
      const user = { apiToken: 'token', impersonating: true, developer: true };
      (getSession as jest.Mock).mockResolvedValue({ user });
      const query = mockQueryFactory('developer', true);
      (makeSsrClient as jest.Mock).mockReturnValue({ query });

      await expect(
        blockImpersonatingNonDevelopers(context),
      ).resolves.toMatchObject({
        props: {
          session: { user },
        },
      });
    });

    it('redirects to dashboard if token says developer but API says not developer', async () => {
      const user = { apiToken: 'token', impersonating: true, developer: true };
      (getSession as jest.Mock).mockResolvedValue({ user });
      const query = mockQueryFactory('developer', false);
      (makeSsrClient as jest.Mock).mockReturnValue({ query });

      await expect(
        blockImpersonatingNonDevelopers(context),
      ).resolves.toMatchObject({
        redirect: {
          destination:
            '/accountLists/account-list-1?redirect=impersonation_blocked',
          permanent: false,
        },
      });
    });
  });

  describe('makeGetServerSideProps', () => {
    it('redirects to the login page if the session is missing', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const getServerSidePropsFromSession = jest.fn();
      const getServerSideProps = makeGetServerSideProps(
        getServerSidePropsFromSession,
      );

      await expect(getServerSideProps(context)).resolves.toEqual({
        redirect: {
          destination: '/login?redirect=%2Fpage%3Fparam%3Dvalue',
          permanent: false,
        },
      });
      expect(getServerSidePropsFromSession).not.toHaveBeenCalled();
    });

    it('calls the custom function and adds the session to the returned props', async () => {
      (getSession as jest.Mock).mockResolvedValue(session);

      const getServerSidePropsFromSession = jest.fn().mockResolvedValue({
        props: {
          data1: 1,
          dataA: 'A',
        },
      });
      const getServerSideProps = makeGetServerSideProps(
        getServerSidePropsFromSession,
      );

      await expect(getServerSideProps(context)).resolves.toEqual({
        props: {
          session,
          data1: 1,
          dataA: 'A',
        },
      });
      expect(getServerSidePropsFromSession).toHaveBeenCalledWith(
        session,
        context,
      );
    });

    it('calls the custom function and passes through redirects', async () => {
      (getSession as jest.Mock).mockResolvedValue(session);

      const getServerSidePropsFromSession = jest.fn().mockResolvedValue({
        redirect: {
          destination: '/new/url',
          permanent: false,
        },
      });
      const getServerSideProps = makeGetServerSideProps(
        getServerSidePropsFromSession,
      );

      await expect(getServerSideProps(context)).resolves.toEqual({
        redirect: {
          destination: '/new/url',
          permanent: false,
        },
      });
      expect(getServerSidePropsFromSession).toHaveBeenCalledWith(
        session,
        context,
      );
    });
  });

  describe('verifyPermission', () => {
    it('should return false if the user is not an admin or a developer', async () => {
      const user = { apiToken: 'token', developer: false };
      (getSession as jest.Mock).mockResolvedValue({ user });

      const query = mockQueryFactory('developer', false);
      (makeSsrClient as jest.Mock).mockReturnValue({ query });

      expect(await verifyPermission(user.apiToken, 'developer')).toEqual(false);
    });

    it('should return true if the user is not an admin or a developer', async () => {
      const user = { apiToken: 'token', developer: false };
      (getSession as jest.Mock).mockResolvedValue({ user });
      const query = mockQueryFactory('developer', true);
      (makeSsrClient as jest.Mock).mockReturnValue({ query });

      expect(await verifyPermission(user.apiToken, 'developer')).toEqual(true);
    });

    it('should return false when API query fails', async () => {
      const query = jest.fn().mockRejectedValue(new Error('Network error'));
      (makeSsrClient as jest.Mock).mockReturnValue({ query });

      expect(await verifyPermission('token', 'admin')).toEqual(false);
    });
  });
});
