import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MassActionsEditFieldsModal } from './MassActionsEditFieldsModal';

const mockEnqueue = jest.fn();
const selectedIds: string[] = ['abc'];
const accountListId = '123456789';
const handleClose = jest.fn();

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

describe('MassActionsEditFieldsModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
  });
  it('Select status and starred, the save action', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, queryByTestId, queryByText } = render(
      <GqlMockedProvider onCall={mutationSpy}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <MassActionsEditFieldsModal
                ids={selectedIds}
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </GqlMockedProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('EditFieldsModal')).toBeInTheDocument(),
    );
    // Status
    userEvent.click(getByRole('combobox', { name: /status/i }));
    await waitFor(() =>
      expect(
        getByRole('option', { name: /appointment scheduled/i }),
      ).toBeInTheDocument(),
    );
    userEvent.click(getByRole('option', { name: /appointment scheduled/i }));
    // Likey to Give
    userEvent.click(getByRole('combobox', { name: /starred/i }));
    await waitFor(() =>
      expect(getByRole('option', { name: /unstarred/i })).toBeInTheDocument(),
    );
    userEvent.click(getByRole('option', { name: /unstarred/i }));
    // Save
    userEvent.click(queryByText('Save') as HTMLInputElement);
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contacts updated!', {
        variant: 'success',
      }),
    );
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });

  it('should show newsletter options in correct order', async () => {
    const mutationSpy = jest.fn();
    const { getByLabelText, findByRole } = render(
      <GqlMockedProvider onCall={mutationSpy}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <MassActionsEditFieldsModal
                ids={selectedIds}
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </GqlMockedProvider>,
    );
    const sendNewsletterInput = getByLabelText('Newsletter');
    userEvent.click(sendNewsletterInput);
    const listbox = await findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent("Don't change");
    expect(options[1]).toHaveTextContent('None');
    expect(options[options.length - 1]).toHaveTextContent('Both');
  });
});
