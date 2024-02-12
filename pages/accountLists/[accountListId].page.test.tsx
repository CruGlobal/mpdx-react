import { GetServerSidePropsContext } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { getToken } from 'next-auth/jwt';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import makeSsrClient from 'pages/api/utils/ssrClient';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import AccountListIdPage, {
  AccountListIdPageProps,
  getServerSideProps,
} from './[accountListId].page';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
jest.mock('pages/api/utils/ssrClient', () => jest.fn());

interface getServerSidePropsReturn {
  props: AccountListIdPageProps;
  redirect: unknown;
}

describe('AccountListsId page', () => {
  const context = {
    req: {} as any,
  };

  describe('NextAuth unauthorized', () => {
    it('should redirect to login', async () => {
      (getToken as jest.Mock).mockReturnValue({
        apiToken: null,
        userID: null,
      });

      const { props, redirect } = (await getServerSideProps(
        context as GetServerSidePropsContext,
      )) as getServerSidePropsReturn;

      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: '/login',
        permanent: false,
      });
    });
  });

  describe('NextAuth authorized', () => {
    beforeEach(() => {
      (getToken as jest.Mock).mockReturnValue({
        apiToken: 'apiToken',
        userID: 'userID',
      });
    });

    it('redirects to the home page on GraphQL query error', async () => {
      (makeSsrClient as jest.Mock).mockRejectedValueOnce(
        new Error('GraphQL Authenication error'),
      );

      const { props, redirect } = (await getServerSideProps(
        context as GetServerSidePropsContext,
      )) as getServerSidePropsReturn;

      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: '/',
        permanent: false,
      });
    });

    it('renders the page without redirect', async () => {
      (getToken as jest.Mock).mockReturnValue({
        apiToken: 'apiToken',
        userID: 'userID',
      });

      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest.fn().mockReturnValue({
          data: {
            accountList: {
              name: 'accountListName',
            },
            user: {
              firstName: 'firstName',
              lastName: 'lastName',
            },
            contacts: {
              totalCount: 5,
            },
          },
        }),
      });

      const { props, redirect } = (await getServerSideProps(
        context as GetServerSidePropsContext,
      )) as getServerSidePropsReturn;

      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <TestRouter>
            <GqlMockedProvider>
              <I18nextProvider i18n={i18n}>
                <AccountListIdPage {...props} />
              </I18nextProvider>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>,
      );

      expect(props.data.accountList.name).toEqual('accountListName');
      expect(redirect).toBeUndefined();
      expect(getByText('Good Morning, firstName.')).toBeInTheDocument();
    });
  });
});
