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
      people: {
        nodes: [
          {
            firstName: 'Will',
            lastName: 'Turner',
            id: '2',
          },
          {
            firstName: 'test',
            lastName: 'guy',
            id: '3',
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
      name: 'Test',
      primaryPerson: {
        id: '1',
      },
      people: {
        nodes: [
          {
            firstName: 'Will',
            lastName: 'Turner',
            id: '2',
          },
          {
            firstName: 'test',
            lastName: 'guy',
            id: '3',
          },
        ],
      },
    },
  },
);

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
    const { getByText, getByRole, findByRole } = render(
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
    const statusInput = getByRole('combobox', { name: 'Status' });

    userEvent.click(statusInput);
    userEvent.click(
      await findByRole('option', { name: 'Appointment Scheduled' }),
    );

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
    const { getByLabelText, getByText, getByRole, getByTestId, queryByText } =
      render(
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
    const frequencyInput = getByRole('combobox', { name: 'Frequency' });

    await waitFor(() =>
      expect(statusInput.textContent).toEqual('Partner - Financial'),
    );

    expect(amountInput).toHaveValue(50);
    expect(frequencyInput.textContent).toEqual('Every 2 Months');

    userEvent.click(statusInput);
    userEvent.click(getByText('Ask in Future'));

    expect(getByTestId('removeCommitmentMessage')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'No' }));

    expect(amountInput).toHaveValue(50);
    expect(frequencyInput.textContent).toEqual('Every 2 Months');
    expect(getByText('Every 2 Months')).toBeInTheDocument();

    userEvent.click(statusInput);
    userEvent.click(getByText('Partner - Financial'));

    userEvent.click(statusInput);
    userEvent.click(getByText('Ask in Future'));

    expect(getByTestId('removeCommitmentMessage')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Yes' }));

    expect(amountInput).toHaveValue(0);
    expect(amountInput).toBeDisabled();
    expect(queryByText('Every 2 Months')).not.toBeInTheDocument();
    expect(statusInput.textContent).toEqual('Ask in Future');

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

  it('should handle when remove commitment warning shows', async () => {
    const {
      getByLabelText,
      getByText,
      getByRole,
      findByText,
      getByTestId,
      queryByTestId,
    } = render(
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
    const frequencyInput = getByRole('combobox', { name: 'Frequency' });

    // Clear amount and frequency
    userEvent.click(statusInput);
    userEvent.click(await findByText('Ask in Future'));
    userEvent.click(getByRole('button', { name: 'Yes' }));

    // Due to the amount being zero, we don't show the remove commitment message
    userEvent.click(statusInput);
    userEvent.click(getByText('Partner - Financial'));
    userEvent.click(statusInput);
    userEvent.click(getByText('Ask in Future'));
    expect(queryByTestId('removeCommitmentMessage')).not.toBeInTheDocument();

    // If frequency and not amount is set we show the remove commitment message
    userEvent.click(statusInput);
    userEvent.click(getByText('Partner - Financial'));
    userEvent.click(frequencyInput);
    userEvent.click(getByText('Every 2 Months'));
    expect(amountInput).toHaveValue(0);
    userEvent.click(statusInput);
    userEvent.click(getByText('Ask in Future'));
    expect(getByTestId('removeCommitmentMessage')).toBeInTheDocument();

    // Clear amount and frequency
    userEvent.click(getByRole('button', { name: 'Yes' }));

    // If amount and not frequency is set we show the remove commitment message
    userEvent.click(statusInput);
    userEvent.click(getByText('Partner - Financial'));
    userEvent.type(amountInput, '50');
    userEvent.click(statusInput);
    userEvent.click(getByText('Ask in Future'));
    expect(getByTestId('removeCommitmentMessage')).toBeInTheDocument();

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

    await waitFor(() =>
      expect(statusInput.textContent).toEqual('Partner - Financial'),
    );

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

  it('should handle editing contact name and primary contact', async () => {
    const mutationSpy = jest.fn();
    const newContactName = 'Guy, Cool and Neat';
    const newPrimaryContactName = `${newContactMock.people.nodes[1].firstName} ${newContactMock.people.nodes[1].lastName}`;
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

    const contactTextBox = getByRole('textbox', {
      hidden: true,
      name: 'Contact',
    });
    userEvent.clear(contactTextBox);
    userEvent.type(contactTextBox, newContactName);
    userEvent.click(
      getByRole('combobox', { hidden: true, name: 'Primary Person' }),
    );
    userEvent.click(
      getByRole('option', { hidden: true, name: newPrimaryContactName }),
    );
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Partnership information updated successfully.',
        {
          variant: 'success',
        },
      ),
    );
    expect(mutationSpy).toHaveGraphqlOperation('UpdateContactPartnership', {
      attributes: {
        name: newContactName,
        primaryPersonId: newContactMock.people.nodes[1].id,
      },
    });
  });

  it('should handle editing next ask date', async () => {
    const { getByLabelText, getByText, getAllByText } = render(
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

  it('should allow user to remove next ask date', async () => {
    const mutationSpy = jest.fn();
    const { getByLabelText, getByText, findByText } = render(
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
    const datePickerButton = getByLabelText('Next Increase Ask');
    userEvent.click(datePickerButton);
    const clearButton = await findByText('Clear');
    userEvent.click(clearButton);
    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateContactPartnership', {
        attributes: {
          nextAsk: null,
        },
      }),
    );
  });
});
