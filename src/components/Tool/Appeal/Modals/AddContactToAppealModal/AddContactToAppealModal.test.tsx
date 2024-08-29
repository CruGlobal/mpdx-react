import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { ContactOptionsQuery } from 'src/components/Task/Modal/Form/Inputs/ContactsAutocomplete/ContactsAutocomplete.generated';
import theme from 'src/theme';
import { AppealsContext } from '../../AppealsContext/AppealsContext';
import { AddContactToAppealModal } from './AddContactToAppealModal';
import { AppealQuery } from './AppealInfo.generated';

const accountListId = 'abc';
const appealId = 'appealId';
const router = {
  query: { accountListId },
  isReady: true,
};
const handleClose = jest.fn();
const mutationSpy = jest.fn();
const refetch = jest.fn();
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
interface ComponentsProps {
  appealMock?: AppealQuery;
  contactOptionsMock?: ContactOptionsQuery;
}

const defaultAppealMock: AppealQuery = {
  appeal: {
    id: appealId,
    contactIds: ['contact-1', 'contact-2'],
  },
};

const defaultContactOptionsMock: ContactOptionsQuery = {
  contacts: {
    nodes: [
      { id: 'contact-3', name: 'Alice' },
      { id: 'contact-4', name: 'Bob' },
      { id: 'contact-5', name: 'Charlie' },
    ],
  },
};

const Components = ({
  appealMock = defaultAppealMock,
  contactOptionsMock = defaultContactOptionsMock,
}: ComponentsProps) => (
  <SnackbarProvider>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{
            Appeal: AppealQuery;
            ContactOptions: ContactOptionsQuery;
          }>
            mocks={{
              Appeal: appealMock,
              ContactOptions: contactOptionsMock,
            }}
            onCall={mutationSpy}
          >
            <AppealsWrapper>
              <AppealsContext.Provider
                value={{
                  accountListId,
                  appealId: appealId,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  contactsQueryResult: { refetch },
                }}
              >
                <AddContactToAppealModal handleClose={handleClose} />
              </AppealsContext.Provider>
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </DndProvider>
  </SnackbarProvider>
);

describe('AddContactToAppealModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
    refetch.mockClear();
    mockEnqueue.mockClear();
  });
  it('default', () => {
    const { getByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Add Contact(s) to Appeal' }),
    ).toBeInTheDocument();
    expect(getByRole('combobox', { name: 'Contacts' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should close modal', () => {
    const { getByRole } = render(<Components />);

    expect(handleClose).toHaveBeenCalledTimes(0);
    userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('adds 2 contacts to appeal and refreshes contacts list', async () => {
    const { getByRole, getByText, findByRole, queryByText } = render(
      <Components />,
    );

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));

    expect(await findByRole('option', { name: 'Alice' })).toBeInTheDocument();

    userEvent.click(getByRole('option', { name: 'Alice' }));
    expect(getByText('Alice')).toBeInTheDocument();

    expect(queryByText('Bob')).not.toBeInTheDocument();
    userEvent.click(getByRole('combobox', { name: 'Contacts' }));

    expect(await findByRole('option', { name: 'Bob' })).toBeInTheDocument();

    userEvent.click(getByRole('option', { name: 'Bob' }));
    expect(getByText('Bob')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        '2 contacts successfully added to your appeal.',
        { variant: 'success' },
      );
    });

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('AssignContactsToAppeal', {
        input: {
          accountListId,
          attributes: {
            id: appealId,
            contactIds: ['contact-1', 'contact-2', 'contact-3', 'contact-4'],
          },
        },
      });
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
