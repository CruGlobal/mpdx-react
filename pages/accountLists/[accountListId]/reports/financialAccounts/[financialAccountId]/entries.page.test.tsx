import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { FinancialAccountQuery } from 'src/components/Reports/FinancialAccountsReport/Context/FinancialAccount.generated';
import { defaultFinancialAccount } from 'src/components/Reports/FinancialAccountsReport/Header/HeaderMocks';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FinancialAccountsPage from './entries.page';

const accountListId = 'account-list-1';
const financialAccountId = 'financialAccountId';
const router = {
  query: {
    accountListId,
    financialAccount: [financialAccountId, 'entries'],
  },
  isReady: true,
};

const Components = () => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              FinancialAccount: FinancialAccountQuery;
            }>
              mocks={{
                FinancialAccount: defaultFinancialAccount,
              }}
            >
              <FinancialAccountsPage />
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('Financial Accounts Page', () => {
  it('should show the transactions page for a financial account', async () => {
    const { findByText, findByRole, getByText, queryByText, queryByRole } =
      render(<Components />);

    expect(await findByText('Account 1')).toBeInTheDocument();

    expect(
      await findByRole('button', { name: 'Export CSV' }),
    ).toBeInTheDocument();

    expect(getByText('Totals for Period')).toBeInTheDocument();

    expect(queryByText('Responsibility Centers')).not.toBeInTheDocument();
    expect(
      queryByRole('heading', { name: 'Category' }),
    ).not.toBeInTheDocument();
  });

  it('should open filters on load and set initial date Range filter', async () => {
    const { findByRole } = render(<Components />);

    expect(await findByRole('heading', { name: 'Filter' })).toBeInTheDocument();
  });

  it('should open and close filters and menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<Components />);

    // Filters
    expect(await findByRole('heading', { name: 'Filter' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Filter' })).not.toBeInTheDocument();

    // Menu
    userEvent.click(getByRole('img', { name: 'Toggle Menu Panel' }));
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Reports' })).not.toBeInTheDocument();
  });
});
