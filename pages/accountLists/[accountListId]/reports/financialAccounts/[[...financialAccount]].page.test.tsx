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
import {
  defaultFinancialAccount,
  defaultFinancialAccountSummary,
} from 'src/components/Reports/FinancialAccountsReport/AccountSummary/AccountSummaryMock';
import { FinancialAccountSummaryQuery } from 'src/components/Reports/FinancialAccountsReport/AccountSummary/financialAccountSummary.generated';
import { FinancialAccountQuery } from 'src/components/Reports/FinancialAccountsReport/Context/FinancialAccount.generated';
import { FinancialAccountsQuery } from 'src/components/Reports/FinancialAccountsReport/FinancialAccounts/FinancialAccounts.generated';
import { FinancialAccountsMock } from 'src/components/Reports/FinancialAccountsReport/FinancialAccounts/FinancialAccountsMocks';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FinancialAccountsPage from './[[...financialAccount]].page';

const accountListId = 'account-list-1';
const financialAccountId = 'financialAccountId';
const defaultRouter = {
  query: { accountListId },
  isReady: true,
};
const entriesRouter = {
  query: {
    accountListId,
    financialAccount: [financialAccountId, 'entries'],
  },
  isReady: true,
};

const Components = ({ router = defaultRouter }: { router?: object }) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              FinancialAccountSummary: FinancialAccountSummaryQuery;
              FinancialAccount: FinancialAccountQuery;
              FinancialAccounts: FinancialAccountsQuery;
            }>
              mocks={{
                FinancialAccountSummary: defaultFinancialAccountSummary,
                FinancialAccount: defaultFinancialAccount,
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

  it('should show the summary page for a financial account', async () => {
    const { findByText, findByRole, getByText, queryByText } = render(
      <Components
        router={{
          query: { accountListId, financialAccount: [financialAccountId] },
          isReady: true,
        }}
      />,
    );

    expect(await findByText('Account 1')).toBeInTheDocument();

    expect(queryByText('Responsibility Centers')).not.toBeInTheDocument();

    expect(
      await findByRole('heading', { name: 'Category' }),
    ).toBeInTheDocument();

    expect(getByText('Opening Balance')).toBeInTheDocument();
  });

  it('should show the transactions page for a financial account', async () => {
    const { findByText, findByRole, getByText, queryByText, queryByRole } =
      render(<Components router={entriesRouter} />);

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
    const { findByRole } = render(<Components router={entriesRouter} />);

    expect(
      await findByRole('heading', { name: 'Filter (1)' }),
    ).toBeInTheDocument();
  });

  it('should open and close filters and menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <Components router={entriesRouter} />,
    );

    // Filters
    expect(
      await findByRole('heading', { name: 'Filter (1)' }),
    ).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(
      queryByRole('heading', { name: 'Filter (1)' }),
    ).not.toBeInTheDocument();

    // Menu
    userEvent.click(getByRole('img', { name: 'Toggle Menu Panel' }));
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Reports' })).not.toBeInTheDocument();
  });
});
