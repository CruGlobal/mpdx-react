import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { OrganizationsContextProvider } from 'pages/accountLists/[accountListId]/settings/organizations/OrganizationsContext';
import theme from '../../../../theme';
import { AccountLists } from './AccountLists';
import { SearchOrganizationsAccountListsQuery } from './AccountLists.generated';
import { AccountListsMocks } from './AccountLists.mock';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

const mockEnqueue = jest.fn();
const mutationSpy = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));
let search = 'search';
const setSearch = jest.fn().mockImplementation((value) => {
  search = value;
});
const clearFilters = jest.fn();
const selectedOrganizationId = 'org111';

const ComponentsWithNoData = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <OrganizationsContextProvider
          selectedOrganizationId={'Org123'}
          selectedOrganizationName={'Org123'}
          search={''}
          setSearch={setSearch}
          clearFilters={clearFilters}
        >
          {children}
        </OrganizationsContextProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <OrganizationsContextProvider
          selectedOrganizationId={selectedOrganizationId}
          selectedOrganizationName={selectedOrganizationId}
          search={search}
          setSearch={setSearch}
          clearFilters={clearFilters}
        >
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 1000, itemHeight: 100 }}
          >
            {children}
          </VirtuosoMockContext.Provider>
        </OrganizationsContextProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const accountList = new AccountListsMocks().accountList;
const SearchOrganizationsAccountListsMock = {
  SearchOrganizationsAccountLists: {
    searchOrganizationsAccountLists: {
      accountLists: [accountList],
    },
  },
};

describe('AccountLists', () => {
  const fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ errors: [] }),
    status: 200,
  });
  beforeEach(() => {
    window.fetch = fetch;
    setSearch.mockClear();
    clearFilters.mockClear();
  });

  it('should show default screen', async () => {
    const { queryByText } = render(
      <Components>
        <GqlMockedProvider<{
          SearchOrganizationsAccountLists: SearchOrganizationsAccountListsQuery;
        }>
          mocks={{
            SearchOrganizationsAccountLists: {
              searchOrganizationsAccountLists: {
                accountLists: [],
                pagination: {
                  page: 0,
                  perPage: 0,
                  totalCount: 0,
                  totalPages: 0,
                },
              },
            },
          }}
        >
          <AccountLists />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(
        queryByText('Start by adding search filters'),
      ).not.toBeInTheDocument();
    });
  });

  it('should show no account to manage', async () => {
    const { getByText } = render(
      <ComponentsWithNoData>
        <GqlMockedProvider<{
          SearchOrganizationsAccountLists: SearchOrganizationsAccountListsQuery;
        }>
          mocks={{
            SearchOrganizationsAccountLists: {
              searchOrganizationsAccountLists: {
                accountLists: [],
                pagination: {
                  page: 0,
                  perPage: 0,
                  totalCount: 0,
                  totalPages: 0,
                },
              },
            },
          }}
        >
          <AccountLists />
        </GqlMockedProvider>
      </ComponentsWithNoData>,
    );

    await waitFor(() => {
      expect(
        getByText('Looks like you have no account lists to manage yet'),
      ).toBeInTheDocument();

      expect(
        getByText('No account lists match your search filters.'),
      ).toBeInTheDocument();

      userEvent.click(getByText('Reset Search'));

      expect(clearFilters).toHaveBeenCalledTimes(1);
    });
  });

  it('should show account', async () => {
    const { getByText, queryByText } = render(
      <Components>
        <GqlMockedProvider<{
          SearchOrganizationsAccountLists: SearchOrganizationsAccountListsQuery;
        }>
          mocks={{
            ...SearchOrganizationsAccountListsMock,
          }}
        >
          <AccountLists />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(
        queryByText('Looks like you have no account lists to manage yet'),
      ).not.toBeInTheDocument();

      expect(
        queryByText('No account lists match your filters.'),
      ).not.toBeInTheDocument();
      expect(queryByText('Reset All Search Filters')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText('Test Account List Name')).toBeInTheDocument();
    });
  });

  it('takes users off the screen after they are deleted', async () => {
    const { getByText, queryByText, getAllByRole, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          SearchOrganizationsAccountLists: SearchOrganizationsAccountListsQuery;
        }>
          mocks={{
            ...SearchOrganizationsAccountListsMock,
          }}
          onCall={mutationSpy}
        >
          <AccountLists />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('Test Account List Name')).toBeInTheDocument();
    });

    const view = getByText(/userfirstname userlastname/i);
    const firstDeleteButton = await within(view).findByRole('button', {
      name: /delete/i,
    });

    userEvent.click(firstDeleteButton);
    userEvent.type(
      getAllByRole('textbox', { name: 'Reason' })[0],
      'this is a test',
    );
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mutationSpy.mock.calls[1][0]).toMatchObject({
        operation: {
          operationName: 'DeleteUser',
          variables: {
            input: {
              reason: 'this is a test',
              resettedUserId: 'e8a19920',
            },
          },
        },
      });

      expect(
        queryByText(/userfirstname userlastname/i),
      ).not.toBeInTheDocument();
    });
  });

  it('takes coaches off the screen after they are removed', async () => {
    const { getByText, queryByText, getAllByRole, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          SearchOrganizationsAccountLists: SearchOrganizationsAccountListsQuery;
        }>
          mocks={{
            ...SearchOrganizationsAccountListsMock,
          }}
          onCall={mutationSpy}
        >
          <AccountLists />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('Test Account List Name')).toBeInTheDocument();
    });

    expect(getByText(/coachFirstName coachLastName/i)).toBeInTheDocument();

    await waitFor(() => {
      userEvent.click(getAllByRole('button', { name: /remove coach/i })[0]);
      userEvent.click(getByRole('button', { name: 'Yes' }));
    });
    await waitFor(() => {
      expect(
        queryByText(/coachFirstName coachLastName/i),
      ).not.toBeInTheDocument();
    });
  });
});
