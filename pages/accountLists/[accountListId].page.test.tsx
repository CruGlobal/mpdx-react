import { GetServerSidePropsContext } from 'next';
import { ApolloError } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { GraphQLError } from 'graphql';
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
    query: {
      accountListId: 'account-list-1',
    },
    resolvedUrl: '/accountLists/account-list-1',
  } as unknown as GetServerSidePropsContext;

  describe('NextAuth unauthorized', () => {
    it('should redirect to login', async () => {
      (getSession as jest.Mock).mockResolvedValueOnce(null);

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
    it('redirects to the home page on GraphQL query error', async () => {
      (makeSsrClient as jest.Mock).mockReturnValue({
        query: jest
          .fn()
          .mockRejectedValue(new Error('GraphQL Authentication error')),
      });

      const { props, redirect } = (await getServerSideProps(
        context,
      )) as GetServerSidePropsReturn;

      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: '/accountLists',
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
  describe('AccountListId Redirects', () => {
    const restApiNotFoundErrorMessage = "Resource 'AccountList' is not valid";

    const makeContext = (
      resolvedUrl = '/accountLists/[accountListId]/contacts',
    ) => {
      return {
        query: {
          accountListId: 'account-list-1',
        },
        resolvedUrl,
      } as unknown as GetServerSidePropsContext;
    };

    it('replaces and redirects to the default account list id if Not Found', async () => {
      const query = jest.fn();

      (makeSsrClient as jest.Mock).mockReturnValue({
        query: query,
      });
      query.mockRejectedValueOnce(
        new ApolloError({
          graphQLErrors: [
            new GraphQLError(restApiNotFoundErrorMessage, {
              extensions: { code: 'NOT_FOUND' },
            }),
          ],
        }),
      );

      query.mockResolvedValueOnce({
        data: {
          user: {
            defaultAccountList: 'default-id',
          },
        },
      });

      expect(await getServerSideProps(makeContext())).toEqual({
        redirect: {
          destination: '/accountLists/default-id/contacts',
          permanent: false,
        },
      });
    });

    it('redirects to the account list selector page if theres no defaultAccountList', async () => {
      const query = jest.fn();

      (makeSsrClient as jest.Mock).mockReturnValue({
        query: query,
      });
      query.mockRejectedValueOnce(
        new ApolloError({
          graphQLErrors: [
            new GraphQLError(restApiNotFoundErrorMessage, {
              extensions: { code: 'NOT_FOUND' },
            }),
          ],
        }),
      );

      query.mockResolvedValueOnce({
        data: {
          user: {
            defaultAccountList: null,
          },
        },
      });

      expect(await getServerSideProps(makeContext())).toEqual({
        redirect: {
          destination: '/accountLists',
          permanent: false,
        },
      });
    });

    it('redirects to the account list selector page if theres an error trying to find defaultAccountList', async () => {
      const query = jest.fn();

      (makeSsrClient as jest.Mock).mockReturnValue({
        query: query,
      });

      query.mockRejectedValueOnce(
        new ApolloError({
          graphQLErrors: [
            new GraphQLError(restApiNotFoundErrorMessage, {
              extensions: { code: 'NOT_FOUND' },
            }),
          ],
        }),
      );

      query.mockResolvedValueOnce(
        new Error('error getting defaultAccountList'),
      );

      expect(await getServerSideProps(makeContext())).toEqual({
        redirect: { destination: '/accountLists', permanent: false },
      });
    });

    it('redirects to the account list selector page if there url is invalid', async () => {
      const query = jest.fn();

      (makeSsrClient as jest.Mock).mockReturnValue({
        query: query,
      });

      query.mockRejectedValueOnce(
        new ApolloError({
          graphQLErrors: [
            new GraphQLError(restApiNotFoundErrorMessage, {
              extensions: { code: 'NOT_FOUND' },
            }),
          ],
        }),
      );

      query.mockResolvedValueOnce({
        data: {
          user: {
            defaultAccountList: 'default-id',
          },
        },
      });

      expect(await getServerSideProps(makeContext('/invalid_url/'))).toEqual({
        redirect: { destination: '/accountLists', permanent: false },
      });
    });
  });
});
