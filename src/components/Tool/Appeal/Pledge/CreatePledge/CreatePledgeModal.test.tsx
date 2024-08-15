import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { PledgeStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AppealsContext } from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import { CreatePledgeModal, PledgeModalEnum } from './CreatePledgeModal';

const accountListId = 'abc';
const appealId = 'appealId';
const router = {
  query: { accountListId },
  isReady: true,
};
const handleClose = jest.fn();
const mutationSpy = jest.fn();
const refetch = jest.fn();

interface ComponentsProps {
  contact?: AppealContactInfoFragment;
}

const defaultContact = {
  id: 'contact-1',
  name: 'Alice',
  pledgeAmount: undefined,
  pledgeFrequency: undefined,
  pledgeCurrency: undefined,
  pledgeReceived: false,
};

const Components = ({ contact = defaultContact }: ComponentsProps) => (
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
                  }}
                >
                  <CreatePledgeModal
                    handleClose={handleClose}
                    contact={contact}
                    type={PledgeModalEnum.Create}
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

describe('CreatePledgeModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
    refetch.mockClear();
  });
  it('default', async () => {
    const { getByRole, getByText } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Add Commitment' }),
    ).toBeInTheDocument();
    expect(getByRole('combobox', { name: 'Contacts' })).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Amount' })).toBeInTheDocument();
    expect(getByText('Currency')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByRole('combobox', { name: 'Currency' })).toBeInTheDocument();
    });
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
    const { getByRole, getByText, queryByText } = render(<Components />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    const amountInput = getByRole('textbox', { name: 'Amount' });
    userEvent.clear(amountInput);
    userEvent.type(amountInput, '0');
    userEvent.tab();
    screen.logTestingPlaygroundURL();
    await waitFor(() =>
      expect(
        getByText(/must use a positive number for amount/i),
      ).toBeInTheDocument(),
    );

    userEvent.clear(amountInput);
    userEvent.tab();
    await waitFor(() =>
      expect(getByText(/amount is required/i)).toBeInTheDocument(),
    );

    userEvent.type(amountInput, '100');
    await waitFor(() => {
      expect(
        queryByText(/must use a positive number for amount/i),
      ).not.toBeInTheDocument();
      expect(queryByText(/amount is required/i)).not.toBeInTheDocument();
    });

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mutationSpy.mock.calls[6][0].operation.operationName).toEqual(
        'CreateAccountListPledge',
      );
      expect(mutationSpy.mock.calls[6][0].operation.variables).toEqual({
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

      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });
});
