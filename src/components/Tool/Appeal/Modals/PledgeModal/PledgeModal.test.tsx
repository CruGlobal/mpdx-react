import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { PledgeStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import {
  AppealsContext,
  TableViewModeEnum,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import { defaultContact } from '../../List/ContactRow/ContactRowMock';
import { PledgeModal } from './PledgeModal';

const accountListId = 'abc';
const appealId = 'appealId';
const router = {
  query: { accountListId },
  isReady: true,
};
const handleClose = jest.fn();
const mutationSpy = jest.fn();
const refetch = jest.fn();
const seRefreshFlowsView = jest.fn();

interface ComponentsProps {
  pledge?: AppealContactInfoFragment['pledges'][0];
  viewMode?: TableViewModeEnum;
}

const Components = ({
  pledge = undefined,
  viewMode = TableViewModeEnum.List,
}: ComponentsProps) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider onCall={mutationSpy}>
              <AppealsWrapper>
                <AppealsContext.Provider
                  value={{
                    accountListId,
                    appealId: appealId,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    contactsQueryResult: { refetch },
                    viewMode,
                    seRefreshFlowsView,
                  }}
                >
                  <PledgeModal
                    handleClose={handleClose}
                    contact={defaultContact}
                    pledge={pledge}
                  />
                </AppealsContext.Provider>
              </AppealsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('PledgeModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
    refetch.mockClear();
  });
  it('default', async () => {
    const { getByRole, getByText, findByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Add Commitment' }),
    ).toBeInTheDocument();

    expect(getByText('You are adding a commitment for')).toBeInTheDocument();
    expect(getByText(defaultContact.name)).toBeInTheDocument();

    expect(getByRole('textbox', { name: 'Amount' })).toBeInTheDocument();
    expect(getByText('Currency')).toBeInTheDocument();

    expect(
      await findByRole('combobox', { name: 'Currency' }),
    ).toBeInTheDocument();

    expect(getByRole('textbox', { name: 'Expected Date' })).toBeInTheDocument();
    expect(getByRole('combobox', { name: 'Status' })).toBeInTheDocument();

    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should close modal', () => {
    const { getByRole } = render(<Components />);

    expect(handleClose).toHaveBeenCalledTimes(0);
    userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('Add commitment', async () => {
    const { getByRole, findByText, queryByText } = render(<Components />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    const amountInput = getByRole('textbox', { name: 'Amount' });
    userEvent.clear(amountInput);
    userEvent.type(amountInput, '0');
    userEvent.tab();

    expect(
      await findByText(/must use a positive number for amount/i),
    ).toBeInTheDocument();

    userEvent.clear(amountInput);
    userEvent.tab();
    expect(await findByText('Amount is required')).toBeInTheDocument();

    userEvent.type(amountInput, '100');
    await waitFor(() => {
      expect(
        queryByText(/must use a positive number for amount/i),
      ).not.toBeInTheDocument();
      expect(queryByText('Amount is required')).not.toBeInTheDocument();
    });

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('CreateAccountListPledge', {
        input: {
          accountListId,
          attributes: {
            appealId: appealId,
            contactId: defaultContact.id,
            amount: 100,
            amountCurrency: 'USD',
            expectedDate: '2020-01-01',
            status: PledgeStatusEnum.NotReceived,
          },
        },
      });
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('Edit commitment', async () => {
    const pledgeId = 'pledge-1';
    const { getByRole, getByText, findByText } = render(
      <Components
        pledge={{
          id: pledgeId,
          amount: 444,
          amountCurrency: 'USD',
          appeal: {
            id: 'appeal-1',
          },
          expectedDate: '2024-08-08',
          status: PledgeStatusEnum.ReceivedNotProcessed,
        }}
      />,
    );

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    expect(
      getByRole('heading', { name: 'Edit Commitment' }),
    ).toBeInTheDocument();
    expect(getByText('You are editing the commitment for')).toBeInTheDocument();

    const amountInput = getByRole('textbox', { name: 'Amount' });

    expect(amountInput).toHaveValue('444');
    expect(getByRole('textbox', { name: 'Expected Date' })).toHaveValue(
      '08/08/2024',
    );

    expect(await findByText('Received')).toBeInTheDocument();

    userEvent.clear(amountInput);
    userEvent.type(amountInput, '500');

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountListPledge', {
        input: {
          pledgeId,
          attributes: {
            id: pledgeId,
            appealId: appealId,
            contactId: defaultContact.id,
            amount: 500,
            amountCurrency: 'USD',
            expectedDate: '2024-08-08',
            status: PledgeStatusEnum.ReceivedNotProcessed,
          },
        },
      });
    });

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(seRefreshFlowsView).not.toHaveBeenCalled();
  });

  it('should refetch the flows columns after adding Commitment on the flows view', async () => {
    const { getByRole } = render(
      <Components viewMode={TableViewModeEnum.Flows} />,
    );

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    const amountInput = getByRole('textbox', { name: 'Amount' });
    userEvent.type(amountInput, '100');

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(seRefreshFlowsView).toHaveBeenCalledTimes(1));
    expect(refetch).not.toHaveBeenCalled();
  });

  it('should refetch the flows columns after editing Commitment on the flows view', async () => {
    const pledgeId = 'pledge-1';
    const { getByRole } = render(
      <Components
        pledge={{
          id: pledgeId,
          amount: 444,
          amountCurrency: 'USD',
          appeal: {
            id: 'appeal-1',
          },
          expectedDate: '2024-08-08',
          status: PledgeStatusEnum.ReceivedNotProcessed,
        }}
        viewMode={TableViewModeEnum.Flows}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(seRefreshFlowsView).toHaveBeenCalledTimes(1));
    expect(refetch).not.toHaveBeenCalled();
  });
});
