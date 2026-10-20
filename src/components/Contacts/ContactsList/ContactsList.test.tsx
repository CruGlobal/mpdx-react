import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { removeTagsFromFilters } from 'pages/accountLists/[accountListId]/tasks/sanitizeFilters';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import theme from 'src/theme';
import useTaskModal from '../../../hooks/useTaskModal';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from '../ContactRow/ContactRow.generated';
import { ContactsList } from './ContactsList';

jest.mock('../../../hooks/useTaskModal');

const accountListId = 'account-list-1';

const contact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc, {
  mocks: {
    name: 'Baggins, Frodo',
    latestAddressChange: {
      startDate: '2026-08-03',
      source: 'Siebel',
      createdByUser: null,
    },
  },
});

const TestComponent: React.FC<{ filters?: ContactFilterSetInput }> = ({
  filters = {},
}) => (
  <TestRouter
    router={{
      pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
      query: {
        accountListId,
        filters: encodeURIComponent(JSON.stringify(filters)),
      },
    }}
  >
    <ThemeProvider theme={theme}>
      <GqlMockedProvider>
        <UrlFiltersProvider sanitizeFilters={removeTagsFromFilters}>
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 1000, itemHeight: 100 }}
          >
            <ContactsContext.Provider
              value={
                {
                  accountListId,
                  isRowChecked: jest.fn(),
                  toggleSelectionById: jest.fn(),
                  contactsQueryResult: {
                    data: {
                      contacts: {
                        nodes: [contact],
                        pageInfo: { hasNextPage: false, endCursor: null },
                      },
                      allContacts: { totalCount: 1 },
                    },
                    loading: false,
                    fetchMore: jest.fn(),
                  },
                } as unknown as ContactsType
              }
            >
              <ContactPanelProvider>
                <ContactsList />
              </ContactPanelProvider>
            </ContactsContext.Provider>
          </VirtuosoMockContext.Provider>
        </UrlFiltersProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal: jest.fn(),
    preloadTaskModal: jest.fn(),
  });
});

describe('ContactsList', () => {
  it('shows each address change while the address changed filter is on', async () => {
    const { findByText } = render(
      <TestComponent
        filters={{ addressChanged: { min: '2026-01-01', max: '2026-10-14' } }}
      />,
    );

    expect(
      await findByText('Address changed Aug 3 · automatic'),
    ).toBeInTheDocument();
  });

  it('hides address changes without the filter', async () => {
    const { findByText, queryByText } = render(<TestComponent />);

    expect(await findByText('Baggins, Frodo')).toBeInTheDocument();
    expect(queryByText(/Address changed/)).not.toBeInTheDocument();
  });
});
