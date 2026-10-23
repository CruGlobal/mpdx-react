import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import theme from 'src/theme';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import { ContactsList } from './ContactsList';

const accountListId = 'account-list-1';
const fetchMore = jest.fn();

const makeContact = (id: string, name: string): ContactRowFragment =>
  ({
    id,
    name,
    lateAt: null,
    pledgeAmount: null,
    pledgeCurrency: 'USD',
    pledgeFrequency: null,
    primaryAddress: null,
    starred: false,
    status: null,
    uncompletedTasksCount: 0,
    people: { nodes: [] },
  }) as unknown as ContactRowFragment;

const TestComponent: React.FC<{ context: Partial<ContactsType> }> = ({
  context,
}) => (
  <TestRouter
    router={{
      pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
      query: { accountListId, offline: 'true' },
      isReady: true,
    }}
  >
    <GqlMockedProvider>
      <ThemeProvider theme={theme}>
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
                  data: undefined,
                  loading: false,
                  fetchMore,
                },
                offlineMode: true,
                cachedContacts: [],
                cachedContactsLoading: false,
                ...context,
              } as unknown as ContactsType
            }
          >
            <UrlFiltersProvider>
              <ContactPanelProvider>
                <ContactsList />
              </ContactPanelProvider>
            </UrlFiltersProvider>
          </ContactsContext.Provider>
        </VirtuosoMockContext.Provider>
      </ThemeProvider>
    </GqlMockedProvider>
  </TestRouter>
);

describe('ContactsList', () => {
  describe('offline mode', () => {
    it('renders cached contacts without checkboxes', async () => {
      const { findByText, queryByRole } = render(
        <TestComponent
          context={{
            cachedContacts: [
              makeContact('c1', 'Alpha, Anne'),
              makeContact('c2', 'Beta, Bob'),
            ],
          }}
        />,
      );

      expect(await findByText('Alpha, Anne')).toBeInTheDocument();
      expect(await findByText('Beta, Bob')).toBeInTheDocument();
      expect(queryByRole('checkbox')).not.toBeInTheDocument();
      expect(fetchMore).not.toHaveBeenCalled();
    });

    it('shows the null state when nothing is cached', async () => {
      const { findByTestId } = render(<TestComponent context={{}} />);

      expect(await findByTestId('contact-null-state')).toBeInTheDocument();
    });
  });
});
