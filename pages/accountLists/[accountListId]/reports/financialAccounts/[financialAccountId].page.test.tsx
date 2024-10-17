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
import { defaultFinancialAccountSummary } from 'src/components/Reports/FinancialAccountsReport/AccountSummary/AccountSummaryMock';
import { FinancialAccountSummaryQuery } from 'src/components/Reports/FinancialAccountsReport/AccountSummary/financialAccountSummary.generated';
import { FinancialAccountQuery } from 'src/components/Reports/FinancialAccountsReport/Context/FinancialAccount.generated';
import { defaultFinancialAccount } from 'src/components/Reports/FinancialAccountsReport/Header/HeaderMocks';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FinancialAccountSummaryPage from './[financialAccountId].page';

const accountListId = 'account-list-1';
const financialAccountId = 'financialAccountId';
const router = {
  query: { accountListId, financialAccount: [financialAccountId] },
  isReady: true,
};

const Components = () => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              FinancialAccountSummary: FinancialAccountSummaryQuery;
              FinancialAccount: FinancialAccountQuery;
            }>
              mocks={{
                FinancialAccountSummary: defaultFinancialAccountSummary,
                FinancialAccount: defaultFinancialAccount,
              }}
            >
              <FinancialAccountSummaryPage />
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('Financial Accounts Page', () => {
  it('should show the summary page for a financial account', async () => {
    const { findByText, findByRole, getByText, queryByText } = render(
      <Components />,
    );

    expect(await findByText('Account 1')).toBeInTheDocument();

    expect(queryByText('Responsibility Centers')).not.toBeInTheDocument();

    expect(
      await findByRole('heading', { name: 'Category' }),
    ).toBeInTheDocument();

    expect(getByText('Opening Balance')).toBeInTheDocument();
  });

  it('should open and close  menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<Components />);

    userEvent.click(await findByRole('img', { name: 'Toggle Menu Panel' }));
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Reports' })).not.toBeInTheDocument();
  });
});
