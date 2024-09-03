import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { AppealStatusEnum } from '../../AppealsContext/AppealsContext';
import { ContactFlowColumn } from './ContactFlowColumn';

const accountListId = 'abc';
const title = 'Test Column';
const onContactSelected = jest.fn();
const changeContactStatus = jest.fn();
const contact = {
  id: 'contactID',
  name: 'Test Person',
  status: StatusEnum.NotInterested,
  primaryAddress: {
    id: 'address',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
  },
};
const router = {
  query: { accountListId },
  isReady: true,
};

const Components = () => (
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
            <AppealsWrapper>
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
                  appealStatus={AppealStatusEnum.Processed}
                />
              </VirtuosoMockContext.Provider>
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </DndProvider>
  </SnackbarProvider>
);

describe('ContactFlowColumn', () => {
  it('should render a column with correct details', async () => {
    const { getByText, getByTestId } = render(<Components />);
    await waitFor(() => expect(getByText(title)).toBeInTheDocument());
    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('Test Person')).toBeInTheDocument();
    expect(getByTestId('column-header')).toHaveStyle({
      backgroundColor: 'theme.palette.mpdxBlue.main',
    });
  });

  it('should open menu', async () => {
    const { getByText, getByTestId, getByRole } = render(<Components />);

    await waitFor(() => expect(getByText(title)).toBeInTheDocument());

    userEvent.click(getByTestId('MoreVertIcon'));
    expect(getByText('Not Interested')).toBeInTheDocument();

    await waitFor(() => {
      getByRole('menuitem', { name: 'Select 1 contact' });
    });
  });
});
