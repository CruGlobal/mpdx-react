import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import {
  enforceAdmin,
  ensureSessionAndAccountList,
  loginRedirect,
  makeGetServerSideProps,
} from './pagePropsHelpers';

jest.mock('next-auth/react');
jest.mock('src/lib/apollo/ssrClient', () => jest.fn());

const context = {
  req: {},
  query: { accountListId: 'account-list-1' },
  resolvedUrl: '/page?param=value',
} as unknown as GetServerSidePropsContext;

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
  });

  describe('enforceAdmin', () => {
    it('does not return a redirect if the user is an admin', async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { admin: true } });

      await expect(enforceAdmin(context)).resolves.not.toMatchObject({
        redirect: {},
      });
    });

    it('returns a redirect if the user is not an admin', async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { admin: false } });

      await expect(enforceAdmin(context)).resolves.toMatchObject({
        redirect: {
          destination: '/accountLists/account-list-1',
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
        req: { url: '/accountLists/_/contacts' },
        resolvedUrl: '/filters?param=value',
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
            req: { url: '/accountLists/_' },
          } as unknown as GetServerSidePropsContext),
        ).resolves.toMatchObject({
          redirect: {
            destination: '/accountLists/defaultAccountList',
          },
        });
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
});
