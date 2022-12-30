import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../../../theme';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import TestRouter from '__tests__/util/TestRouter';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { UpdateDonationMutation } from './EditDonation.generated';
import { EditDonationModal } from './EditDonationModal';
import { Donation } from '../DonationsReportTable';

const time = new Date();
const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

const handleClose = jest.fn();

const donation: Donation = {
  appeal: null,
  contactId: 'contact1',
  convertedAmount: 100.0,
  currency: 'CAD',
  date: time,
  designation: 'Designation (0000)',
  foreignAmount: 100.0,
  foreignCurrency: 'CAD',
  id: 'abc',
  method: 'BRANK_TRANS',
  partner: 'partner',
  partnerId: '123',
};

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

describe('DonationsReportTable', () => {
  it('renders with data', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider<UpdateDonationMutation> onCall={mutationSpy}>
                <EditDonationModal
                  donation={donation}
                  open={true}
                  handleClose={handleClose}
                  startDate={time.toString()}
                  endDate={time.toString()}
                />
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(getByText('Edit Donation')).toBeInTheDocument());
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Amount' })).toHaveValue('100');
  });

  it('clicks close button', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider<UpdateDonationMutation> onCall={mutationSpy}>
                <EditDonationModal
                  donation={donation}
                  open={true}
                  handleClose={handleClose}
                  startDate={time.toString()}
                  endDate={time.toString()}
                />
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    await waitFor(() => expect(getByText('Edit Donation')).toBeInTheDocument());
    expect(handleClose).not.toHaveBeenCalled();
    userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('opens and closes delete modal', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole, queryByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider<UpdateDonationMutation> onCall={mutationSpy}>
                <EditDonationModal
                  donation={donation}
                  open={true}
                  handleClose={handleClose}
                  startDate={time.toString()}
                  endDate={time.toString()}
                />
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(getByText('Edit Donation')).toBeInTheDocument());
    expect(
      queryByText('Are you sure you wish to delete this donation?'),
    ).not.toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Delete' }));
    expect(
      getByText('Are you sure you wish to delete this donation?'),
    ).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'No' }));
    await waitFor(() =>
      expect(
        queryByText('Are you sure you wish to delete this donation?'),
      ).not.toBeInTheDocument(),
    );
  });
});
