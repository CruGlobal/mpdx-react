import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import theme from '../../theme';
import { Donation } from '../Reports/DonationsReport/Table/DonationsReportTable';
import { EditDonationModal } from './EditDonationModal';
import { UpdateDonationMutation } from './EditDonationModal.generated';

const time = DateTime.fromISO('2021-03-25');
const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

const handleClose = jest.fn();

const mocks = {
  EditDonationModalGetAppeals: {
    appeals: {
      nodes: [
        {
          id: 'appeal-1',
          name: 'End of Year Ask',
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    },
  },
};

const donation: Donation = {
  appeal: null,
  appealAmount: null,
  contactId: 'contact1',
  convertedAmount: 100.0,
  currency: 'CAD',
  date: time,
  designationAccount: { id: 'designation-1', name: 'Designation (0000)' },
  foreignAmount: 100.0,
  foreignCurrency: 'CAD',
  id: 'abc',
  method: 'BRANK_TRANS',
  partner: 'partner',
  partnerId: '123',
};
const donationWithAppeal: Donation = {
  ...donation,
  appeal: {
    id: 'appeal-1',
    name: 'End of Year Ask',
  },
  appealAmount: 50,
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

describe('EditDonationModal', () => {
  it('renders with data', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <EditDonationModal
                  donation={donation}
                  open={true}
                  handleClose={handleClose}
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

  it('renders with appeal', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider<{ UpdateDonation: UpdateDonationMutation }>
                mocks={mocks}
                onCall={mutationSpy}
              >
                <EditDonationModal
                  donation={donationWithAppeal}
                  open={true}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Donation')).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Appeal Amount' })).toHaveValue('50');

    userEvent.click(getByRole('button', { name: 'Appeal' }));
    await waitFor(() =>
      expect(
        getByRole('option', { name: 'End of Year Ask' }),
      ).toBeInTheDocument(),
    );
    expect(getByRole('option', { name: 'None' })).toBeInTheDocument();
  });

  it('edits fields', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <EditDonationModal
                  donation={donation}
                  open={true}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(getByText('Edit Donation')).toBeInTheDocument());
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument();

    const amountTextbox = getByRole('textbox', {
      name: 'Amount',
    });
    expect(amountTextbox).toHaveValue('100');
    userEvent.type(amountTextbox, '2');
    expect(amountTextbox).toHaveValue('1002');

    const dateButton = getByRole('textbox', {
      name: 'Choose date, selected date is Mar 25, 2021',
    });
    expect(dateButton).toHaveValue('3/25/2021');
    userEvent.click(dateButton);
    userEvent.click(getByRole('gridcell', { name: '27' }));
    expect(dateButton).toHaveValue('3/27/2021');
  });

  it('saves edits', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider<{ UpdateDonation: UpdateDonationMutation }>
                mocks={mocks}
                onCall={mutationSpy}
              >
                <EditDonationModal
                  donation={donation}
                  open={true}
                  handleClose={handleClose}
                />
              </GqlMockedProvider>
            </TestRouter>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(getByText('Edit Donation')).toBeInTheDocument());
    const amountTextbox = getByRole('textbox', { name: 'Amount' });
    userEvent.type(amountTextbox, '0');
    mutationSpy.mockReset();
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(handleClose).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Donation updated!', {
        variant: 'success',
      }),
    );
    expect(mutationSpy).toHaveBeenCalledTimes(1);
    expect(mutationSpy.mock.calls[0][0]).toMatchObject({
      operation: {
        operationName: 'UpdateDonation',
        variables: {
          attributes: {
            amount: 1000,
          },
        },
      },
    });
  });

  it('clicks close button', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
                <EditDonationModal
                  donation={donation}
                  open={true}
                  handleClose={handleClose}
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
              <GqlMockedProvider onCall={mutationSpy}>
                <EditDonationModal
                  donation={donation}
                  open={true}
                  handleClose={handleClose}
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

  it('clicks the delete confirmation', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole, queryByText, getByTestId, queryByTestId } =
      render(
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <TestRouter router={router}>
                <GqlMockedProvider onCall={mutationSpy}>
                  <EditDonationModal
                    donation={donation}
                    open={true}
                    handleClose={handleClose}
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
    expect(queryByTestId('loading-circle')).not.toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Yes' }));
    expect(getByTestId('loading-circle')).toBeInTheDocument();
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Donation deleted!', {
        variant: 'success',
      }),
    );
  });
});
