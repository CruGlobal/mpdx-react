import { GetServerSidePropsContext } from 'next';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { useNextSetupPage } from 'src/components/Setup/useNextSetupPage';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import AccountPage, { getServerSideProps } from './account.page';

jest.mock('src/components/Setup/useNextSetupPage');
jest.mock('src/lib/apollo/ssrClient');

const next = jest.fn();
(useNextSetupPage as jest.MockedFn<typeof useNextSetupPage>).mockReturnValue({
  next,
});

const push = jest.fn();
const router = {
  push,
};

const context = {
  resolvedUrl: '/accountLists/account-list-1',
} as unknown as GetServerSidePropsContext;

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => {
  const accountListOptions = {
    accountLists: {
      nodes: [1, 2, 3].map((id) => ({
        id: `account-list-${id}`,
        name: `Account List ${id}`,
      })),
    },
  };

  return (
    <TestRouter router={router}>
      <GqlMockedProvider onCall={mutationSpy}>
        <AccountPage accountListOptions={accountListOptions} />
      </GqlMockedProvider>
    </TestRouter>
  );
};

describe('Setup account page', () => {
  it('renders account options, saves default account, and advances to the next page', async () => {
    const { getByRole } = render(<TestComponent />);

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
    expect(next).toHaveBeenCalled();
  });

  it('disables save button until the user selects an account', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Continue Tour' })).toBeDisabled();

    userEvent.click(getByRole('combobox', { name: 'Account' }));
    userEvent.click(getByRole('option', { name: 'Account List 1' }));
    expect(getByRole('button', { name: 'Continue Tour' })).not.toBeDisabled();
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
        destination: '/login?redirect=%2FaccountLists%2Faccount-list-1',
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
