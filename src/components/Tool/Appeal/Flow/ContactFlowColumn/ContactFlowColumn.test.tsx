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
import { GetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import theme from 'src/theme';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { defaultContact } from '../../List/ContactRow/ContactRowMock';
import { ContactFlowColumn } from './ContactFlowColumn';

const accountListId = 'abc';
const title = 'Test Column';
const appealId = 'appealId';
const isChecked = jest.fn().mockImplementation(() => false);
const selectMultipleIds = jest.fn();
const deselectMultipleIds = jest.fn();
const toggleSelectionById = jest.fn();
const changeContactStatus = jest.fn();
const getContactUrl = jest.fn().mockReturnValue({
  contactUrl: `/contacts/${defaultContact.id}`,
});
const router = {
  query: { accountListId },
  isReady: true,
};

interface ComponentsProps {
  appealStatus?: AppealStatusEnum;
}

const Components = ({
  appealStatus = AppealStatusEnum.Processed,
}: ComponentsProps) => (
  <SnackbarProvider>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{
            Contacts: ContactsQuery;
            GetIdsForMassSelection: GetIdsForMassSelectionQuery;
          }>
            mocks={{
              Contacts: {
                contacts: {
                  nodes: [
                    defaultContact,
                    {
                      ...defaultContact,
                      id: `${defaultContact.id}2`,
                    },
                  ],
                  pageInfo: { endCursor: 'Mg', hasNextPage: false },
                  totalCount: 2,
                },
              },
              GetIdsForMassSelection: {
                contacts: {
                  nodes: [
                    {
                      id: defaultContact.id,
                    },
                    {
                      id: `${defaultContact.id}2`,
                    },
                  ],
                  totalCount: 2,
                },
              },
            }}
          >
            <AppealsWrapper>
              <AppealsContext.Provider
                value={
                  {
                    appealId,
                    sanitizedFilters: {},
                    starredFilter: {},
                    selectMultipleIds,
                    deselectMultipleIds,
                    toggleSelectionById,
                    isRowChecked: isChecked,
                    getContactUrl,
                  } as unknown as AppealsType
                }
              >
                <VirtuosoMockContext.Provider
                  value={{ viewportHeight: 300, itemHeight: 100 }}
                >
                  <ContactFlowColumn
                    accountListId={accountListId}
                    color={theme.palette.mpdxBlue.main}
                    title={title}
                    changeContactStatus={changeContactStatus}
                    appealStatus={appealStatus}
                  />
                </VirtuosoMockContext.Provider>
              </AppealsContext.Provider>
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </DndProvider>
  </SnackbarProvider>
);

describe('ContactFlowColumn', () => {
  it('should render a column with correct details', async () => {
    const { getByText, getAllByText, findByText, getByTestId } = render(
      <Components />,
    );
    expect(await findByText(title)).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
    expect(getAllByText('Test, Name')[0]).toBeInTheDocument();
    expect(getByTestId('column-header')).toHaveStyle({
      backgroundColor: 'theme.palette.mpdxBlue.main',
    });
  });

  it('should open menu', async () => {
    const { getAllByText, findByText, getByTestId, findByRole } = render(
      <Components />,
    );

    expect(await findByText(title)).toBeInTheDocument();
    expect(getAllByText('Ask In Future')[0]).toBeInTheDocument();
    userEvent.click(getByTestId('MoreVertIcon'));

    expect(
      await findByRole('menuitem', { name: 'Select all 2 contacts' }),
    ).toBeInTheDocument();
  });

  it('should select all contacts', async () => {
    const { getByTestId, findByText, findByRole } = render(<Components />);

    expect(await findByText(title)).toBeInTheDocument();
    userEvent.click(getByTestId('MoreVertIcon'));
    userEvent.click(
      await findByRole('menuitem', { name: 'Select all 2 contacts' }),
    );

    await waitFor(() =>
      expect(selectMultipleIds).toHaveBeenCalledWith([
        defaultContact.id,
        `${defaultContact.id}2`,
      ]),
    );
  });

  it('should deselect all contacts', async () => {
    const { getByTestId, findByText, findByRole } = render(<Components />);

    expect(await findByText(title)).toBeInTheDocument();

    userEvent.click(getByTestId('MoreVertIcon'));
    userEvent.click(await findByRole('menuitem', { name: 'Deselect All' }));

    await waitFor(() =>
      expect(deselectMultipleIds).toHaveBeenCalledWith([
        defaultContact.id,
        `${defaultContact.id}2`,
      ]),
    );
  });

  it('"asked" column should has the "Add Contact to Appeal" button', async () => {
    const { findByText } = render(
      <Components appealStatus={AppealStatusEnum.Asked} />,
    );

    expect(await findByText('Add Contact to Appeal')).toBeInTheDocument();

    userEvent.click(await findByText('Add Contact to Appeal'));

    expect(await findByText('Add Contact(s) to Appeal')).toBeInTheDocument();
  });

  it('other columns should not have the "Add Contact to Appeal" button', async () => {
    const { findByText, queryByText } = render(<Components />);

    expect(await findByText(title)).toBeInTheDocument();

    expect(queryByText('Add Contact to Appeal')).not.toBeInTheDocument();
  });
});
