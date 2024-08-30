import { GetServerSidePropsContext } from 'next';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import AccountPage, { getServerSideProps } from './account.page';

jest.mock('src/lib/apollo/ssrClient');

const push = jest.fn();
const router = {
  push,
};

const context = {
  req: {},
} as unknown as GetServerSidePropsContext;

describe('Setup account page', () => {
  it('renders account options, saves default account, and advances to the next page', async () => {
    const accountListOptions = {
      accountLists: {
        nodes: [1, 2, 3].map((id) => ({
          id: `account-list-${id}`,
          name: `Account List ${id}`,
        })),
      },
    };

    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <TestRouter router={router}>
        <GqlMockedProvider onCall={mutationSpy}>
          <AccountPage accountListOptions={accountListOptions} />
        </GqlMockedProvider>
      </TestRouter>,
    );

    expect(
      getByRole('heading', { name: 'Set default account' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Account' }));
    userEvent.click(getByRole('option', { name: 'Account List 1' }));
    const continueButton = getByRole('button', { name: 'Continue Tour' });
    userEvent.click(continueButton);
    expect(continueButton).toBeDisabled();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateUserDefaultAccount', {
        input: { attributes: { defaultAccountList: 'account-list-1' } },
      }),
    );
    expect(push).toHaveBeenCalledWith(
      '/accountLists/account-list-1/settings/preferences',
    );
  });
});

describe('getServerSideProps', () => {
  const query = jest.fn();
  const mutate = jest.fn();

  beforeEach(() => {
    (makeSsrClient as jest.MockedFn<typeof makeSsrClient>).mockReturnValue({
      query,
      mutate,
    } as unknown as ApolloClient<NormalizedCacheObject>);
  });

  it('redirects to the login page if the session is missing', async () => {
    (getSession as jest.MockedFn<typeof getSession>).mockResolvedValueOnce(
      null,
    );

    await expect(getServerSideProps(context)).resolves.toEqual({
      redirect: {
        destination: '/login',
        permanent: false,
      },
    });
  });

  it('sets the single account list as the default', async () => {
    query.mockResolvedValue({
      data: {
        accountLists: {
          nodes: [{ id: 'account-list-1' }],
        },
      },
    });

    await expect(getServerSideProps(context)).resolves.toEqual({
      redirect: {
        destination: '/accountLists/account-list-1/settings/preferences',
        permanent: false,
      },
    });
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            attributes: {
              defaultAccountList: 'account-list-1',
            },
          },
        },
      }),
    );
  });

  it('swallows server-side mutation errors', async () => {
    const accountListOptions = {
      accountLists: {
        nodes: [{ id: 'account-list-1' }],
      },
    };
    query.mockResolvedValue({
      data: accountListOptions,
    });
    mutate.mockRejectedValue(new Error('Failed'));

    await expect(getServerSideProps(context)).resolves.toEqual({
      props: {
        accountListOptions,
        session,
      },
    });
  });

  it('does not set an account list as the default when there are multiple', async () => {
    const accountListOptions = {
      accountLists: {
        nodes: [{ id: 'account-list-1' }, { id: 'account-list-2' }],
      },
    };
    query.mockResolvedValue({
      data: accountListOptions,
    });

    await expect(getServerSideProps(context)).resolves.toEqual({
      props: {
        accountListOptions,
        session,
      },
    });
    expect(mutate).not.toHaveBeenCalled();
  });
});
