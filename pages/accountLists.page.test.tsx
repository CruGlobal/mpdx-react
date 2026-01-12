import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import { UserSetupStageEnum } from 'src/graphql/types.generated';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import { getServerSideProps } from './accountLists.page';

jest.mock('src/lib/apollo/ssrClient', () => jest.fn());

interface GetServerSidePropsReturn {
  props: Record<string, never>;
  redirect: unknown;
}

const accountListId = 'account-list-1';

describe('Account Lists page', () => {
  const context = {
    resolvedUrl: '/accountLists/account-list-1',
  } as GetServerSidePropsContext;

  describe('NextAuth unauthorized', () => {
    it('should redirect to login', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const { props, redirect } = (await getServerSideProps(
        context,
      )) as GetServerSidePropsReturn;

      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: '/login?redirect=%2FaccountLists%2Faccount-list-1',
        permanent: false,
      });
    });
  });

  describe('NextAuth authorized', () => {
    beforeEach(() => {
      (getSession as jest.Mock).mockResolvedValue(session);
    });

    it('redirects user to the setup tour is user.setup is not null', async () => {
      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest.fn().mockResolvedValue({
          data: {
            user: { id: 'user-1', setup: UserSetupStageEnum.NoAccountLists },
            accountLists: { nodes: [] },
          },
        }),
      });

      const result = await getServerSideProps(context);
      expect(result).toEqual({
        redirect: {
          destination: '/setup/start',
          permanent: false,
        },
      });
    });

    it('redirects user to their accountList page if only one accountList', async () => {
      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest.fn().mockResolvedValue({
          data: {
            user: { id: 'user-1', setup: null },
            accountLists: {
              nodes: [{ id: accountListId }],
              pageInfo: { hasNextPage: false },
            },
          },
        }),
      });

      const { props, redirect } = (await getServerSideProps(
        context,
      )) as GetServerSidePropsReturn;

      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: `/accountLists/${accountListId}`,
        permanent: false,
      });
    });

    it('does not redirect if multiple accountLists', async () => {
      const accountLists = {
        nodes: [{ id: accountListId }],
        pageInfo: { hasNextPage: true },
      };

      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest.fn().mockResolvedValue({
          data: {
            user: { id: 'user-1', setup: null },
            accountLists,
          },
        }),
      });

      const { redirect } = (await getServerSideProps(
        context,
      )) as GetServerSidePropsReturn;
      expect(redirect).toBeUndefined();
    });
  });
});
