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
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AppealsContext } from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import { CreatePledgeModal } from './CreatePledgeModal';

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
  it('default', () => {
    const { getByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Add Commitment' }),
    ).toBeInTheDocument();
    expect(getByRole('combobox', { name: 'Contacts' })).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Amount' })).toBeInTheDocument();
    expect(getByRole('combobox', { name: 'Currency' })).toBeInTheDocument();
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

  it('adds 2 contacts to appeal and refreshes contacts list', async () => {
    const { getByRole, getByText, queryByText } = render(<Components />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));

    await waitFor(() => {
      expect(getByRole('option', { name: 'Alice' })).toBeInTheDocument();
      userEvent.click(getByRole('option', { name: 'Alice' }));
      expect(getByText('Alice')).toBeInTheDocument();
    });

    expect(queryByText('Bob')).not.toBeInTheDocument();
    userEvent.click(getByRole('combobox', { name: 'Contacts' }));

    await waitFor(() => {
      expect(getByRole('option', { name: 'Bob' })).toBeInTheDocument();
      userEvent.click(getByRole('option', { name: 'Bob' }));
      expect(getByText('Bob')).toBeInTheDocument();
    });

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mutationSpy.mock.calls[8][0].operation.operationName).toEqual(
        'AssignContactsToAppeal',
      );
      expect(mutationSpy.mock.calls[8][0].operation.variables).toEqual({
        input: {
          accountListId,
          attributes: {
            id: appealId,
            contactIds: ['contact-1', 'contact-2', 'contact-3', 'contact-4'],
          },
        },
      });

      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });
});
