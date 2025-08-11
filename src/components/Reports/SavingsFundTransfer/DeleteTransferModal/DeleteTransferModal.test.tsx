import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { StatusEnum, mockData } from '../mockData';
import { DeleteTransferModal } from './DeleteTransferModal';

const mutationSpy = jest.fn();
const handleClose = jest.fn();
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

const mockTransfer = {
  ...mockData.history[0],
  status: StatusEnum.Ongoing,
};
const TestComponent: React.FC = () => {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <DeleteTransferModal
              handleClose={handleClose}
              transfer={mockTransfer}
            />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SnackbarProvider>
  );
};

describe('DeleteTransferModal', () => {
  it('renders the modal', () => {
    const { getByText } = render(<TestComponent />);

    // temporary modal title
    expect(getByText('Stop Transfer: ${{transfer}}')).toBeInTheDocument();
    expect(
      getByText('Are you sure you want to stop this recurring transfer?'),
    ).toBeInTheDocument();
  });

  it('renders snackbar on delete success', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Yes' }));
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Transfer stopped successfully',
        { variant: 'success' },
      );
    });
  });
});
