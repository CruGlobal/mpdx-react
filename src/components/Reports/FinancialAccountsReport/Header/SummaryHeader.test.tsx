import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { FinancialAccountQuery } from '../Context/FinancialAccount.generated';
import { defaultFinancialAccount } from './HeaderMocks';
import { SummaryHeader } from './SummaryHeader';

const accountListId = 'account-list-1';
const financialAccountId = 'financialAccountId';
const handleNavListToggle = jest.fn();
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
              FinancialAccount: FinancialAccountQuery;
            }>
              mocks={{
                FinancialAccount: defaultFinancialAccount,
              }}
            >
              <SummaryHeader
                accountListId={accountListId}
                financialAccountId={financialAccountId}
                handleNavListToggle={handleNavListToggle}
              />
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('Financial Account Summary Header', () => {
  it('should show initial view', async () => {
    const { findByText, getByRole, getByText, queryByRole } = render(
      <Components />,
    );

    expect(await findByText('Account 1')).toBeInTheDocument();
    expect(getByRole('link', { name: 'Summary' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Transactions' })).toBeInTheDocument();
    expect(getByText('$1,000')).toBeInTheDocument();

    expect(getByText('accountCode - Organization 1')).toBeInTheDocument();

    expect(
      queryByRole('button', {
        name: 'Export CSV',
      }),
    ).not.toBeInTheDocument();

    expect(getByRole('img', { name: 'Toggle Menu Panel' })).toBeInTheDocument();
  });

  it('should have correct links for Summary and Transaction', async () => {
    const { findByRole, getByRole } = render(<Components />);

    expect(await findByRole('link', { name: 'Summary' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/financialAccounts/financialAccountId',
    );
    expect(getByRole('link', { name: 'Transactions' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/financialAccounts/financialAccountId/entries',
    );
  });
});
