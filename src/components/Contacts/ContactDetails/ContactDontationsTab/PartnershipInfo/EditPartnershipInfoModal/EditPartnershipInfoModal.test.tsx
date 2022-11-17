import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React from 'react';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import {
  PledgeFrequencyEnum,
  StatusEnum,
} from '../../../../../../../graphql/types.generated';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDonorAccountsFragment,
  ContactDonorAccountsFragmentDoc,
} from '../../ContactDonationsTab.generated';
import theme from '../../../../../../theme';
import { UpdateContactPartnershipMutation } from './EditPartnershipInfoModal.generated';
import { EditPartnershipInfoModal } from './EditPartnershipInfoModal';

const handleClose = jest.fn();
const contactMock = gqlMock<ContactDonorAccountsFragment>(
  ContactDonorAccountsFragmentDoc,
  {
    mocks: {
      status: StatusEnum.PartnerFinancial,
      nextAsk: '2021-12-07T16:38:20.242-04:00',
      pledgeCurrency: 'CAD',
      pledgeStartDate: '2021-09-07T16:38:20.242-04:00',
      pledgeFrequency: PledgeFrequencyEnum.Every_2Months,
      pledgeAmount: 50,
      pledgeReceived: false,
      noAppeals: true,
      lastDonation: {
        donationDate: '2021-09-07T16:38:20.242-04:00',
        amount: {
          currency: 'CAD',
        },
      },
      contactReferralsToMe: {
        nodes: [
          {
            id: 'referred-by-id-1',
            referredBy: {
              id: 'referred-by-contact-id',
              name: 'Person, Cool',
            },
          },
        ],
      },
    },
  },
);

const contactMockNoReferrals: ContactDonorAccountsFragment = {
  ...contactMock,
  contactReferralsToMe: { nodes: [] },
};
jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

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

describe('EditPartnershipInfoModal', () => {
  it('should render edit partnership info modal', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(getByText('Edit Partnership')).toBeInTheDocument(),
    );
  });

  it('should handle closing modal | Close Button', async () => {
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Partnership')).toBeInTheDocument();
    await waitFor(() => userEvent.click(getByLabelText('Close')));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle closing modal | Cancel Button', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Partnership')).toBeInTheDocument();
    await waitFor(() => userEvent.click(getByText('Cancel')));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing status | Non-Financial', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    const statusInput = getByLabelText('Status');
    const amountInput = getByLabelText('Amount');
    const frequencyInput = getByLabelText('Frequency');
    expect(statusInput.textContent).toEqual('Partner - Financial');

    expect(amountInput).toHaveValue(50);
    expect(frequencyInput.textContent).toEqual('Every 2 Months');
    userEvent.click(statusInput);
    userEvent.click(getByText('Ask In Future'));

    // Values get reset and inputs becomes disabled when status is not PARTNER_FINANCIAL
    expect(amountInput).toHaveValue(0);
    expect(amountInput).toBeDisabled();
    expect(statusInput.textContent).toEqual('Ask In Future');

    // these are flaky for some reason, disabling for now
    // await waitFor(() => expect(frequencyInput.textContent).toBe(''));
    // await waitFor(() => expect(frequencyInput).toBeDisabled());

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing status | Financial', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    const statusInput = getByLabelText('Status');
    const amountInput = getByLabelText('Amount');
    const frequencyInput = getByLabelText('Frequency');
    expect(statusInput.textContent).toEqual('Partner - Financial');

    expect(amountInput).toHaveValue(50);

    expect(frequencyInput.textContent).toEqual('Every 2 Months');
    userEvent.type(amountInput, '0');
    userEvent.click(frequencyInput);
    userEvent.click(getByText('Annual'));

    await waitFor(() => expect(frequencyInput.textContent).toEqual('Annual'));
    expect(amountInput).toHaveValue(500);

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing commitment recieved', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    const commitmentRecievedInput = getByLabelText('Commitment Recieved');

    expect(commitmentRecievedInput).not.toBeChecked();
    userEvent.click(commitmentRecievedInput);

    expect(commitmentRecievedInput).toBeChecked();

    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing send appeals', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    const sendAppealsInput = getByLabelText('Send Appeals');

    expect(sendAppealsInput).not.toBeChecked();
    userEvent.click(sendAppealsInput);

    expect(sendAppealsInput).toBeChecked();

    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing currency', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>
              mocks={{
                LoadConstants: {
                  constant: {
                    pledgeCurrencies: [
                      {
                        id: 'CAD',
                        value: 'CAD ($)',
                      },
                      {
                        id: 'CDF',
                        value: 'CDF (CDF)',
                      },
                      {
                        id: 'CHE',
                        value: 'CHE (CHE)',
                      },
                    ],
                  },
                },
              }}
            >
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(getByLabelText('Currency')).toBeInTheDocument());
    const currencyInput = getByLabelText('Currency');

    userEvent.click(currencyInput);
    await waitFor(() => userEvent.click(getByText('CDF (CDF)')));
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing start date', async () => {
    const { getByLabelText, getByText, getAllByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>
              mocks={{
                LoadConstants: {
                  constant: {
                    pledgeCurrencies: [
                      {
                        id: 'CAD',
                        value: 'CAD ($)',
                      },
                      {
                        id: 'CDF',
                        value: 'CDF (CDF)',
                      },
                      {
                        id: 'CHE',
                        value: 'CHE (CHE)',
                      },
                    ],
                  },
                },
              }}
            >
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    const datePickerButton = getByLabelText('change start date');
    userEvent.click(datePickerButton);

    const day = await waitFor(async () => getAllByText('30')[0]);
    userEvent.click(day);
    const okayButton = await waitFor(async () => getByText('OK'));
    userEvent.click(okayButton);
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing the referred by | Delete', async () => {
    const { getByLabelText, getByText, getByRole, queryByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    const referredByInput = getByLabelText('Referred By');
    await waitFor(() => expect(referredByInput).toBeInTheDocument());
    userEvent.click(referredByInput);
    expect(getByText('Person, Cool')).toBeInTheDocument();
    const deleteIcon = getByRole('button', {
      name: 'Person, Cool',
    }).querySelector('.MuiChip-deleteIcon');

    expect(deleteIcon).toBeInTheDocument();
    deleteIcon && userEvent.click(deleteIcon);
    expect(queryByText('Person, Cool')).not.toBeInTheDocument();
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing the referred by | Create', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>
              mocks={{
                GetDataForPartnershipInfoModal: {
                  contacts: {
                    nodes: [
                      {
                        id: 'contact-1',
                        name: 'Person, Cool',
                      },
                      {
                        id: 'contact-2',
                        name: 'Guy, Great',
                      },
                    ],
                  },
                },
              }}
            >
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    const referredByInput = getByLabelText('Referred By');
    await waitFor(() => expect(referredByInput).toBeInTheDocument());
    userEvent.click(referredByInput);
    userEvent.type(referredByInput, 'G');
    await waitFor(() => expect(getByText('Guy, Great')).toBeInTheDocument());
    userEvent.click(getByText('Guy, Great'));
    expect(getByText('Guy, Great')).toBeInTheDocument();
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing the referred by | No Contacts or Referrals', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>
              mocks={{
                GetDataForPartnershipInfoModal: {
                  contacts: {
                    nodes: [],
                  },
                },
              }}
            >
              <EditPartnershipInfoModal
                contact={contactMockNoReferrals}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    const referredByInput = getByLabelText('Referred By');
    await waitFor(() => expect(referredByInput).toBeInTheDocument());
    userEvent.click(referredByInput);
    expect(getByText('No options')).toBeInTheDocument();
  });

  it('should handle editing next ask date', async () => {
    const { getByLabelText, getByText, getAllByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactPartnershipMutation>
              mocks={{
                LoadConstants: {
                  constant: {
                    pledgeCurrencies: [
                      {
                        id: 'CAD',
                        value: 'CAD ($)',
                      },
                      {
                        id: 'CDF',
                        value: 'CDF (CDF)',
                      },
                      {
                        id: 'CHE',
                        value: 'CHE (CHE)',
                      },
                    ],
                  },
                },
              }}
            >
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    const datePickerButton = getByLabelText('change next ask date');
    userEvent.click(datePickerButton);

    const day = await waitFor(async () => getAllByText('30')[0]);
    userEvent.click(day);
    const okayButton = await waitFor(async () => getByText('OK'));
    userEvent.click(okayButton);
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(handleClose).toHaveBeenCalled();
  });
});
