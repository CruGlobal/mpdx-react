import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from '@mui/styles';
import { SnackbarProvider } from 'notistack';
import { GroupItemContent } from 'react-virtuoso';
import { ContactsQuery } from '../../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import theme from '../../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../../graphql/types.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactFlowColumn } from './ContactFlowColumn';

const accountListId = 'abc';
const title = 'Test Column';
const onContactSelected = jest.fn();
const changeContactStatus = jest.fn();
const contact = {
  id: '123',
  name: 'Test Person',
  status: 'PARTNER_FINANCIAL',
  primaryAddress: {
    id: 'address',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
  },
};
const router = {
  query: { accountListId },
  isReady: true,
};

jest.mock('react-virtuoso', () => ({
  // eslint-disable-next-line react/display-name
  GroupedVirtuoso: ({
    itemContent,
  }: {
    itemContent: GroupItemContent<undefined>;
  }) => {
    return <div>{itemContent(0, 0, undefined)}</div>;
  },
}));

describe('ContactFlowColumn', () => {
  it('should render a column with correct details', async () => {
    const { getByText, getByTestId } = render(
      <SnackbarProvider>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider<ContactsQuery>
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
                <ContactFlowColumn
                  accountListId={accountListId}
                  selectedFilters={{}}
                  color={theme.palette.mpdxBlue.main}
                  title={title}
                  onContactSelected={onContactSelected}
                  changeContactStatus={changeContactStatus}
                  statuses={[ContactFilterStatusEnum.PartnerFinancial]}
                />
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </DndProvider>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(getByText(title)).toBeInTheDocument());
    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('Test Person')).toBeInTheDocument();
    expect(getByTestId('column-header')).toHaveStyle({
      backgroundColor: 'theme.palette.mpdxBlue.main',
    });
  });
});
