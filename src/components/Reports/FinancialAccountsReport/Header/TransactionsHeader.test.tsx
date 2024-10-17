import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { FinancialAccountsWrapper } from 'pages/accountLists/[accountListId]/reports/financialAccounts/[financialAccountId]/Wrapper';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { FinancialAccountQuery } from '../Context/FinancialAccount.generated';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import { defaultFinancialAccount } from './HeaderMocks';
import { TransactionsHeader } from './TransactionsHeader';

const accountListId = 'account-list-1';
const financialAccountId = 'financialAccountId';
const handleNavListToggle = jest.fn();
const defaultHasActiveFilters = false;
const handleFilterListToggle = jest.fn();
const defaultSearchTerm = '';
const setSearchTerm = jest.fn();
const handleExportCSV = jest.fn();

const router = {
  query: { accountListId },
  isReady: true,
};

interface ComponentsProps {
  disableExportCSV?: boolean;
  hasActiveFilters?: boolean;
  searchTerm?: string;
}
const Components = ({
  hasActiveFilters = defaultHasActiveFilters,
  searchTerm = defaultSearchTerm,
  disableExportCSV = false,
}: ComponentsProps) => (
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
              <FinancialAccountsWrapper>
                <FinancialAccountContext.Provider
                  value={
                    {
                      accountListId,
                      financialAccountId,
                      financialAccountsQuery: {
                        data: defaultFinancialAccount,
                        loading: false,
                      },
                      handleNavListToggle,
                      handleFilterListToggle,
                      setSearchTerm,
                      hasActiveFilters,
                      searchTerm,
                    } as unknown as FinancialAccountType
                  }
                >
                  <TransactionsHeader
                    disableExportCSV={disableExportCSV}
                    handleExportCSV={handleExportCSV}
                  />
                </FinancialAccountContext.Provider>
              </FinancialAccountsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('Financial Account Header', () => {
  it('should show transactions header', async () => {
    const { findByText, findByRole, getByTestId, getByRole } = render(
      <Components />,
    );

    expect(await findByText('Account 1')).toBeInTheDocument();

    expect(
      await findByRole('button', { name: 'Export CSV' }),
    ).toBeInTheDocument();

    expect(getByTestId('SearchIcon')).toBeInTheDocument();

    expect(
      getByRole('img', { name: 'Toggle Filter Panel' }),
    ).toBeInTheDocument();
  });

  it('should export CSV on click of the button', async () => {
    const { findByRole } = render(<Components />);

    const exportButton = await findByRole('button', { name: 'Export CSV' });

    userEvent.click(exportButton);

    expect(handleExportCSV).toHaveBeenCalled();
  });

  it('should disable export CSV button when loading data', async () => {
    const { findByRole } = render(<Components disableExportCSV={true} />);

    const exportButton = await findByRole('button', { name: 'Export CSV' });

    expect(exportButton).toBeDisabled();
  });

  it('should update search on type', async () => {
    const { getByTestId } = render(<Components disableExportCSV={true} />);

    const view = getByTestId('FinancialAccountHeader');

    const searchInput = within(view).getByRole('textbox');

    userEvent.type(searchInput, 'test');

    expect(setSearchTerm).toHaveBeenCalledWith('test');
  });
});
