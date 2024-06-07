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
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import {
  ContactFilterStatusEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { ContactFlowColumn } from './ContactFlowColumn';

const accountListId = 'abc';
const title = 'Test Column';
const onContactSelected = jest.fn();
const changeContactStatus = jest.fn();
const contact = {
  id: '123',
  name: 'Test Person',
  status: StatusEnum.PartnerFinancial,
  primaryAddress: {
    id: 'address',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
  },
};
const router = {
  query: { accountListId },
  isReady: true,
};

describe('ContactFlowColumn', () => {
  it('should render a column with correct details', async () => {
    const { getByText, findByText, getByTestId } = render(
      <SnackbarProvider>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider<{ Contacts: ContactsQuery }>
                mocks={{
                  Contacts: {
                    contacts: {
                      nodes: [contact],
                      pageInfo: { endCursor: 'Mg', hasNextPage: false },
                      totalCount: 1,
                    },
                  },
                }}
              >
                <ContactsWrapper>
                  <VirtuosoMockContext.Provider
                    value={{ viewportHeight: 300, itemHeight: 100 }}
                  >
                    <ContactFlowColumn
                      accountListId={accountListId}
                      selectedFilters={{}}
                      color={theme.palette.mpdxBlue.main}
                      title={title}
                      onContactSelected={onContactSelected}
                      changeContactStatus={changeContactStatus}
                      statuses={[ContactFilterStatusEnum.PartnerFinancial]}
                    />
                  </VirtuosoMockContext.Provider>
                </ContactsWrapper>
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </DndProvider>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(getByText(title)).toBeInTheDocument());
    expect(getByText('1')).toBeInTheDocument();
    expect(await findByText('Test Person')).toBeInTheDocument();
    expect(getByTestId('column-header')).toHaveStyle({
      backgroundColor: 'theme.palette.mpdxBlue.main',
    });
  });
});
