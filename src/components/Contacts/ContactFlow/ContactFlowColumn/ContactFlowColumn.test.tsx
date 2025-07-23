import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import {
  ContactFilterStatusEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { ContactFlowColumn } from './ContactFlowColumn';

const accountListId = 'abc';
const title = 'Test Column';
const changeContactStatus = jest.fn();
const mutationSpy = jest.fn();
const contact = {
  id: '123',
  name: 'Test Person',
  status: StatusEnum.PartnerFinancial,
  starred: false,
  primaryAddress: {
    id: 'address',
    street: '123 Test St',
    city: 'Test City',
    state: 'GA',
    postalCode: '12345',
    country: 'Test Country',
    geo: 'geo',
    source: 'MPDX',
    createdAt: '2021-01-01',
  },
};
const router = {
  query: { accountListId },
  isReady: true,
};

const Components: React.FC = () => (
  <SnackbarProvider>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{ Contacts: ContactsQuery }>
            mocks={{
              Contacts: {
                contacts: {
                  nodes: [
                    contact,
                    {
                      ...contact,
                      id: '456',
                      starred: true,
                    },
                  ],
                  pageInfo: { endCursor: 'Mg', hasNextPage: false },
                  totalCount: 2,
                },
              },
            }}
            onCall={mutationSpy}
          >
            <UrlFiltersProvider>
              <VirtuosoMockContext.Provider
                value={{ viewportHeight: 300, itemHeight: 100 }}
              >
                <ContactPanelProvider>
                  <ContactFlowColumn
                    accountListId={accountListId}
                    color={theme.palette.mpdxBlue.main}
                    title={title}
                    changeContactStatus={changeContactStatus}
                    statuses={[StatusEnum.PartnerFinancial]}
                  />
                </ContactPanelProvider>
              </VirtuosoMockContext.Provider>
            </UrlFiltersProvider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </DndProvider>
  </SnackbarProvider>
);

describe('ContactFlowColumn', () => {
  it('should render a column with correct details', async () => {
    const { getByText, getAllByText, getByTestId } = render(<Components />);
    await waitFor(() => expect(getByText(title)).toBeInTheDocument());
    expect(getByText('2')).toBeInTheDocument();
    expect(getAllByText('Test Person')[0]).toBeInTheDocument();
    expect(getByTestId('column-header')).toHaveStyle({
      backgroundColor: 'theme.palette.mpdxBlue.main',
    });

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('Contacts', {
        accountListId,
        contactsFilters: {
          status: [ContactFilterStatusEnum.PartnerFinancial],
        },
      });
    });
  });
});
