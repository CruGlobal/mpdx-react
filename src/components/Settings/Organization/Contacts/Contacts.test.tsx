import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { OrganizationsContextProvider } from 'pages/accountLists/[accountListId]/settings/organizations/OrganizationsContext';
import theme from '../../../../theme';
import { SearchOrganizationsContactsQuery } from './Contact.generated';
import { Contacts } from './Contacts';
import { ContactsMocks } from './contactsMocks';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

const mockEnqueue = jest.fn();
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

const Components = ({
  children,
  selectedOrganizationId = 'org111',
  selectedOrganizationName = 'Cru',
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <OrganizationsContextProvider
          selectedOrganizationId={selectedOrganizationId}
          selectedOrganizationName={selectedOrganizationName}
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

const contact = new ContactsMocks().contact;
const SearchOrganizationsContactsMock = {
  SearchOrganizationsContacts: {
    searchOrganizationsContacts: {
      contacts: [contact],
      pagination: {
        page: 0,
        perPage: 3,
        totalCount: 9,
        totalPages: 3,
      },
    },
  },
};

describe('Contacts', () => {
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
    const { getByText } = render(
      <Components selectedOrganizationId="" selectedOrganizationName="">
        <GqlMockedProvider<{
          SearchOrganizationsContacts: SearchOrganizationsContactsQuery;
        }>>
          <Contacts />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('Start by adding search filters')).toBeInTheDocument();
    });
  });

  it('should show message when not contacts are found', async () => {
    const { getByText } = render(
      <Components>
        <GqlMockedProvider<{
          SearchOrganizationsContacts: SearchOrganizationsContactsQuery;
        }>
          mocks={{
            SearchOrganizationsContacts: {
              searchOrganizationsContacts: {
                contacts: [],
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
          <Contacts />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(
        getByText('No contacts match your search filters'),
      ).toBeInTheDocument();
    });
  });

  it('should show account', async () => {
    const mutationSpy = jest.fn();
    const { getByText, queryByText } = render(
      <Components>
        <GqlMockedProvider<{
          SearchOrganizationsContacts: SearchOrganizationsContactsQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...SearchOrganizationsContactsMock,
          }}
        >
          <Contacts />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(
        queryByText('No contacts match your search filters'),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText('Lastname, Firstnames')).toBeInTheDocument();
    });
  });

  it('should remove contact when anonymized', async () => {
    const mutationSpy = jest.fn();
    const { getByText, queryByText, getAllByRole, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          SearchOrganizationsContacts: SearchOrganizationsContactsQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            ...SearchOrganizationsContactsMock,
          }}
        >
          <Contacts />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('Lastname, Firstnames')).toBeInTheDocument();
    });
    userEvent.click(getAllByRole('button', { name: 'Anonymize' })[0]);
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(queryByText('Lastname, Firstnames')).not.toBeInTheDocument();
    });
  });
});
