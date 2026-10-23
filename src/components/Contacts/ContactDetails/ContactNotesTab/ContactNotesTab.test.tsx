import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockNavigatorOnline } from '__tests__/util/mockNavigatorOnline';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactNotesTab } from './ContactNotesTab';
import { GetContactNotesQuery } from './ContactNotesTab.generated';

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

const setOnline = mockNavigatorOnline();

describe('ContactNotesTab', () => {
  it('renders', () => {
    const { queryByPlaceholderText } = render(
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactNotesTab accountListId="123" contactId="abc" />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>,
    );
    expect(queryByPlaceholderText('Add contact notes')).toBeVisible();
  });

  it('holds unsaved notes while offline and saves them once when back online', async () => {
    const mutationSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider<{ GetContactNotes: GetContactNotesQuery }>
            mocks={{
              GetContactNotes: { contact: { id: 'abc', notes: '' } },
            }}
            onCall={mutationSpy}
          >
            <ContactDetailProvider>
              <ContactNotesTab accountListId="123" contactId="abc" />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>,
    );
    const input = getByPlaceholderText('Add contact notes');
    await waitFor(() => expect(input).toBeEnabled());
    userEvent.type(input, 'abc');
    setOnline(false);

    // Wait past the 500ms debounce
    await new Promise((resolve) => setTimeout(resolve, 700));
    const updateCalls = () =>
      mutationSpy.mock.calls.filter(
        ([{ operation }]) => operation.operationName === 'UpdateContactNotes',
      );
    expect(updateCalls()).toHaveLength(0);
    expect(input).toBeDisabled();
    expect(input).toHaveValue('abc');

    setOnline(true);

    await waitFor(() => expect(updateCalls()).toHaveLength(1));
    expect(updateCalls()[0][0].operation.variables.notes).toBe('abc');
    expect(input).toBeEnabled();
  });

  it('saves new note', async () => {
    const mutationSpy = jest.fn();
    const note = 'cool new note!';
    const { queryByPlaceholderText, getByText } = render(
      <TestRouter>
        <SnackbarProvider>
          <GqlMockedProvider onCall={mutationSpy}>
            <ContactDetailProvider>
              <ContactNotesTab accountListId="123" contactId="abc" />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>,
    );
    const input = queryByPlaceholderText('Add contact notes');
    expect(input).toBeVisible();
    input && userEvent.type(input, note);
    await waitFor(() => expect(getByText(note)).toBeVisible());
    const { operation } = mutationSpy.mock.calls[0][0];

    await waitFor(() =>
      expect(operation.variables.accountListId).toEqual('123'),
    );

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Notes successfully saved.', {
        variant: 'success',
        preventDuplicate: true,
      }),
    );
  });
});
