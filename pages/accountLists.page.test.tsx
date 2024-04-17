import { GetServerSidePropsContext } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { getSession } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import AccountListsPage, {
  AccountListsPageProps,
  getServerSideProps,
} from './accountLists.page';

jest.mock('src/lib/apollo/ssrClient', () => jest.fn());

interface GetServerSidePropsReturn {
  props: AccountListsPageProps;
  redirect: unknown;
}

const accountListId = 'accountID1';

describe('Account Lists page', () => {
  const context = {
    req: {} as any,
  };

  describe('NextAuth unauthorized', () => {
    it('should redirect to login', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: {
          apiToken: null,
          userID: null,
        },
      });

      const { props, redirect } = (await getServerSideProps(
        context as GetServerSidePropsContext,
      )) as GetServerSidePropsReturn;

      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: '/login',
        permanent: false,
      });
    });
  });

  describe('NextAuth authorized', () => {
    beforeEach(() => {
      (getSession as jest.Mock).mockResolvedValue({
        user: {
          apiToken: 'apiToken',
          userID: 'userID',
        },
      });
    });

    it('redirects user to their accountList page if only one accountList', async () => {
      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest.fn().mockResolvedValue({
          data: {
            accountLists: { nodes: [{ id: accountListId }] },
          },
        }),
      });

      const { props, redirect } = (await getServerSideProps(
        context as GetServerSidePropsContext,
      )) as GetServerSidePropsReturn;

      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <AccountListsPage {...props} />
          </I18nextProvider>
        </ThemeProvider>,
      );

      expect(queryByText('My Accounts')).not.toBeInTheDocument();
      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: `/accountLists/${accountListId}`,
        permanent: false,
      });
    });

    it("renders all the user's accounts and does not redirect if multiple accountLists", async () => {
      const accountLists = {
        nodes: [{ id: accountListId }, { id: 'accountID2' }],
      };

      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest.fn().mockResolvedValue({
          data: {
            accountLists,
          },
        }),
      });

      const { props, redirect } = (await getServerSideProps(
        context as GetServerSidePropsContext,
      )) as GetServerSidePropsReturn;

      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <AccountListsPage {...props} />
          </I18nextProvider>
        </ThemeProvider>,
      );

      expect(getByText('My Accounts')).toBeInTheDocument();
      expect(props.data?.accountLists).toEqual(accountLists);
      expect(redirect).toBeUndefined();
    });
  });
});
