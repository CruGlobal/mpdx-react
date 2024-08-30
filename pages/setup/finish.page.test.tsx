import { GetServerSidePropsContext } from 'next';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import AccountPage, { getServerSideProps } from './finish.page';

jest.mock('src/lib/apollo/ssrClient');

const push = jest.fn();
const router = {
  push,
};

const context = {} as unknown as GetServerSidePropsContext;

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <TestRouter router={router}>
    <GqlMockedProvider onCall={mutationSpy}>
      <AccountPage defaultAccountListId="account-list-1" />
    </GqlMockedProvider>
  </TestRouter>
);

describe('Finish account page', () => {
  it('immediately sets setup position to finish', async () => {
    render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSetupPosition', {
        setupPosition: 'finish',
      }),
    );
  });

  it('yes button redirects to tools', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: /Yes/ }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSetupPosition', {
        setupPosition: '',
      }),
    );
    expect(push).toHaveBeenCalledWith(
      '/accountLists/account-list-1/tools?setup=1',
    );
  });

  it('no button redirects to the dashboard', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: /Nope/ }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSetupPosition', {
        setupPosition: '',
      }),
    );
    expect(push).toHaveBeenCalledWith('/accountLists/account-list-1');
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

  it('redirects to the default account page if no default account is set', async () => {
    query.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          defaultAccountList: null,
        },
      },
    });

    await expect(getServerSideProps(context)).resolves.toEqual({
      redirect: {
        destination: '/setup/account',
        permanent: false,
      },
    });
  });

  it('retrieves the default account list id', async () => {
    query.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          defaultAccountList: 'account-list-1',
        },
      },
    });

    await expect(getServerSideProps(context)).resolves.toMatchObject({
      props: {
        defaultAccountListId: 'account-list-1',
      },
    });
  });
});
