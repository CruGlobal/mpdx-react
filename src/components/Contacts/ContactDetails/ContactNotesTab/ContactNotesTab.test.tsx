import React from 'react';
import { SnackbarProvider } from 'notistack';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../ContactDetailContext';
import { UpdateContactNotesMutation } from './ContactNotesTab.generated';
import { ContactNotesTab } from './ContactNotesTab';

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

describe('ContactNotesTab', () => {
  it('renders', () => {
    const { queryByPlaceholderText } = render(
      <SnackbarProvider>
        <GqlMockedProvider<UpdateContactNotesMutation>>
          <ContactDetailProvider>
            <ContactNotesTab accountListId="123" contactId="abc" />
          </ContactDetailProvider>
        </GqlMockedProvider>
      </SnackbarProvider>,
    );
    expect(queryByPlaceholderText('Add contact notes')).toBeVisible();
  });

  it('saves new note', async () => {
    const mutationSpy = jest.fn();
    const note = 'cool new note!';
    const { queryByPlaceholderText, getByText } = render(
      <SnackbarProvider>
        <GqlMockedProvider<UpdateContactNotesMutation> onCall={mutationSpy}>
          <ContactDetailProvider>
            <ContactNotesTab accountListId="123" contactId="abc" />
          </ContactDetailProvider>
        </GqlMockedProvider>
      </SnackbarProvider>,
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
      }),
    );
  });
});
