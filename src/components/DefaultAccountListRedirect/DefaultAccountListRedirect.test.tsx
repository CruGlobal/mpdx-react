import { render, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { DefaultAccountListRedirect } from './DefaultAccountListRedirect';

const replace = jest.fn();
const mutationSpy = jest.fn();

interface TestComponentProps {
  accountListId: string;
  asPath: string;
  defaultAccountList?: string | null;
  queryFails?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  accountListId,
  asPath,
  defaultAccountList = 'default-account-list',
  queryFails = false,
}) => {
  const mocks: ApolloErgonoMockMap = {
    GetDefaultAccount: {
      user: queryFails
        ? () => {
            throw new GraphQLError('Network error');
          }
        : { defaultAccountList },
    },
  };

  return (
    <TestRouter router={{ query: { accountListId }, asPath, replace }}>
      <GqlMockedProvider mocks={mocks} onCall={mutationSpy}>
        <DefaultAccountListRedirect>
          <div>Page</div>
        </DefaultAccountListRedirect>
      </GqlMockedProvider>
    </TestRouter>
  );
};

describe('DefaultAccountListRedirect', () => {
  it('renders the page for a real account list id', () => {
    const { getByText } = render(
      <TestComponent
        accountListId="account-list-1"
        asPath="/accountLists/account-list-1/contacts"
      />,
    );

    expect(getByText('Page')).toBeInTheDocument();
    expect(mutationSpy).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects "_" to the default account list, keeping the rest of the URL', async () => {
    const { queryByText } = render(
      <TestComponent
        accountListId="_"
        asPath="/accountLists/_/contacts/contact-1?filters=%7B%7D#notes"
      />,
    );

    expect(queryByText('Page')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        '/accountLists/default-account-list/contacts/contact-1?filters=%7B%7D#notes',
      ),
    );
  });

  it('redirects "_" to the account list chooser when there is no default account list', async () => {
    render(
      <TestComponent
        accountListId="_"
        asPath="/accountLists/_/contacts"
        defaultAccountList={null}
      />,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/accountLists'));
  });

  it('redirects "_" to the account list chooser when the default account list fails to load', async () => {
    render(
      <TestComponent
        accountListId="_"
        asPath="/accountLists/_/contacts"
        queryFails
      />,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/accountLists'));
  });
});
