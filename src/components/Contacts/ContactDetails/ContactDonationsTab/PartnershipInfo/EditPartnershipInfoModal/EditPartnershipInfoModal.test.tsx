import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import {
  LikelyToGiveEnum,
  PledgeFrequencyEnum,
  SendNewsletterEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import theme from '../../../../../../theme';
import {
  ContactDonorAccountsFragment,
  ContactDonorAccountsFragmentDoc,
} from '../../ContactDonationsTab.generated';
import { EditPartnershipInfoModal } from './EditPartnershipInfoModal';
import { UpdateContactPartnershipMutation } from './EditPartnershipInfoModal.generated';

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
      sendNewsletter: SendNewsletterEnum.Email,
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
      likelyToGive: LikelyToGiveEnum.Likely,
    },
  },
);

const newContactMock = gqlMock<ContactDonorAccountsFragment>(
  ContactDonorAccountsFragmentDoc,
  {
    mocks: {
      status: null,
      nextAsk: null,
      pledgeCurrency: null,
      pledgeStartDate: null,
      pledgeFrequency: null,
      pledgeAmount: null,
      pledgeReceived: false,
      sendNewsletter: null,
      noAppeals: true,
      lastDonation: null,
      contactReferralsToMe: {
        nodes: [],
      },
      likelyToGive: null,
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
            <GqlMockedProvider>
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
            <GqlMockedProvider>
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
    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle closing modal | Cancel Button', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
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
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should save when only status is inputted', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <EditPartnershipInfoModal
                contact={newContactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    const statusInput = getByLabelText('Status');

    userEvent.click(statusInput);
    userEvent.click(getByText('Ask In Future'));

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

  it('should handle editing status | Non-Financial', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
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
            <GqlMockedProvider>
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

  it('should handle editing commitment received', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    const commitmentReceivedInput = getByLabelText('Commitment Received');

    expect(commitmentReceivedInput).not.toBeChecked();
    userEvent.click(commitmentReceivedInput);

    expect(commitmentReceivedInput).toBeChecked();

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
            <GqlMockedProvider>
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
            <GqlMockedProvider<{
              UpdateContactPartnership: UpdateContactPartnershipMutation;
            }>
              mocks={{
                LoadConstants: {
                  constant: {
                    pledgeCurrencies: [
                      {
                        code: 'CAD',
                        codeSymbolString: 'CAD ($)',
                        name: 'Canadian Dollar',
                      },
                      {
                        code: 'CDF',
                        codeSymbolString: 'CDF (CDF)',
                        name: 'Congolese Franc',
                      },
                      {
                        code: 'CHE',
                        codeSymbolString: 'CHE (CHE)',
                        name: 'WIR Euro',
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
    userEvent.click(getByText('Congolese Franc - CDF (CDF)'));
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

  it('should handle editing Likely to give', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider onCall={mutationSpy}>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    mutationSpy.mockClear();

    userEvent.click(getByRole('combobox', { name: 'Likely To Give' }));
    userEvent.click(getByRole('option', { name: 'Most Likely' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(mutationSpy.mock.lastCall).toMatchObject([
      {
        operation: {
          operationName: 'UpdateContactPartnership',
          variables: {
            attributes: {
              likelyToGive: 'MOST_LIKELY',
            },
          },
        },
      },
    ]);
  });

  it('should handle editing start date', async () => {
    const { getByLabelText, getByText, getAllByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              UpdateContactPartnership: UpdateContactPartnershipMutation;
            }>
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
    const datePickerButton = getByLabelText('Start Date');
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

  it('should handle editing newsletter', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider onCall={mutationSpy}>
              <EditPartnershipInfoModal
                contact={contactMock}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );
    mutationSpy.mockClear();

    userEvent.click(getByRole('combobox', { name: 'Newsletter' }));
    userEvent.click(getByRole('option', { name: 'Physical' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(mutationSpy.mock.lastCall).toMatchObject([
      {
        operation: {
          operationName: 'UpdateContactPartnership',
          variables: {
            attributes: {
              sendNewsletter: 'PHYSICAL',
            },
          },
        },
      },
    ]);
  });

  it('should handle editing the referred by | Delete', async () => {
    const { getByLabelText, getByText, getByRole, queryByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
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
            <GqlMockedProvider<{
              UpdateContactPartnership: UpdateContactPartnershipMutation;
            }>
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
            <GqlMockedProvider<{
              UpdateContactPartnership: UpdateContactPartnershipMutation;
            }>
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
            <GqlMockedProvider<{
              UpdateContactPartnership: UpdateContactPartnershipMutation;
            }>
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
    const datePickerButton = getByLabelText('Next Increase Ask');
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
