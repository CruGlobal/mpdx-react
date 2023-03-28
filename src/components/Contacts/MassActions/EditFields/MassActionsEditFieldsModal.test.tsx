import React from 'react';
import { SnackbarProvider } from 'notistack';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import theme from 'src/theme';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
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
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <MassActionsEditFieldsModal
                ids={selectedIds}
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('EditFieldsModal')).toBeInTheDocument(),
    );
    // Status
    userEvent.click(getByRole('button', { name: /status/i }));
    await waitFor(() =>
      expect(
        getByRole('option', { name: /appointment scheduled/i }),
      ).toBeInTheDocument(),
    );
    userEvent.click(getByRole('option', { name: /appointment scheduled/i }));
    // Likey to Give
    userEvent.click(getByRole('button', { name: /starred/i }));
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
});
