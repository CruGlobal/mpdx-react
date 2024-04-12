import { GetServerSidePropsContext } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { getSession } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import AccountListIdPage, {
  AccountListIdPageProps,
  getServerSideProps,
} from './[accountListId].page';

jest.mock('src/lib/apollo/ssrClient', () => jest.fn());

interface GetServerSidePropsReturn {
  props: AccountListIdPageProps;
  redirect: unknown;
}

describe('AccountListsId page', () => {
  const context = {
    req: {},
    query: {
      accountListId: 'account-list-1',
    },
  } as unknown as GetServerSidePropsContext;

  describe('NextAuth unauthorized', () => {
    it('should redirect to login', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        user: {
          apiToken: null,
          userID: null,
        },
      });

      const { props, redirect } = (await getServerSideProps(
        context,
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

    it('redirects to the home page on GraphQL query error', async () => {
      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest
          .fn()
          .mockRejectedValueOnce(new Error('GraphQL Authentication error')),
      });

      const { props, redirect } = (await getServerSideProps(
        context,
      )) as GetServerSidePropsReturn;

      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: '/',
        permanent: false,
      });
    });

    it('renders the page without redirect', async () => {
      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest.fn().mockResolvedValue({
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
        context,
      )) as GetServerSidePropsReturn;

      expect(props.data.accountList.name).toEqual('accountListName');
      expect(redirect).toBeUndefined();

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

      expect(getByText('Good Morning, firstName.')).toBeInTheDocument();
    });
  });
});
