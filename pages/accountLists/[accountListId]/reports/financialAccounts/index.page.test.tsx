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
import { FinancialAccountsQuery } from 'src/components/Reports/FinancialAccountsReport/FinancialAccounts/FinancialAccounts.generated';
import { FinancialAccountsMock } from 'src/components/Reports/FinancialAccountsReport/FinancialAccounts/FinancialAccountsMocks';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FinancialAccountsPage from './index.page';

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
  isReady: true,
};

const Components = () => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              FinancialAccounts: FinancialAccountsQuery;
            }>
              mocks={{
                ...FinancialAccountsMock,
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
  it('should show initial financial accounts page', async () => {
    const { findByText } = render(<Components />);

    expect(await findByText('Responsibility Centers')).toBeInTheDocument();

    expect(await findByText('Test Account')).toBeInTheDocument();
  });

  it('should open and close  menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<Components />);

    userEvent.click(
      await findByRole('button', { name: 'Toggle Navigation Panel' }),
    );
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Reports' })).not.toBeInTheDocument();
  });
});
