import React from 'react';
import { QueryResult } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import {
  FinancialAccountQuery,
  FinancialAccountQueryVariables,
} from '../Context/FinancialAccount.generated';
import { FinancialAccountContext } from '../Context/FinancialAccountsContext';
import { defaultFinancialAccount } from './HeaderMocks';
import { TransactionsHeader } from './TransactionsHeader';

const accountListId = 'account-list-1';
const financialAccountId = 'financialAccountId';
const handleNavListToggle = jest.fn();
const handleFilterListToggle = jest.fn();
const handleExportCSV = jest.fn();

interface ComponentsProps {
  disableExportCSV?: boolean;
}

const Components = ({ disableExportCSV = false }: ComponentsProps) => {
  return (
    <I18nextProvider i18n={i18n}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <ThemeProvider theme={theme}>
            <TestRouter
              router={{
                query: { accountListId },
                isReady: true,
              }}
            >
              <UrlFiltersProvider>
                <GqlMockedProvider<{
                  FinancialAccount: FinancialAccountQuery;
                }>
                  mocks={{
                    FinancialAccount: defaultFinancialAccount,
                  }}
                >
                  <FinancialAccountContext.Provider
                    value={{
                      accountListId,
                      financialAccountId,
                      financialAccountQuery: {
                        data: defaultFinancialAccount,
                        loading: false,
                      } as unknown as QueryResult<
                        FinancialAccountQuery,
                        FinancialAccountQueryVariables
                      >,
                      isNavListOpen: false,
                      designationAccounts: [],
                      setDesignationAccounts: jest.fn(),
                      panelOpen: null,
                      setPanelOpen: jest.fn(),
                      handleNavListToggle,
                      handleFilterListToggle,
                    }}
                  >
                    <TransactionsHeader
                      disableExportCSV={disableExportCSV}
                      handleExportCSV={handleExportCSV}
                    />
                  </FinancialAccountContext.Provider>
                </GqlMockedProvider>
              </UrlFiltersProvider>
            </TestRouter>
          </ThemeProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </I18nextProvider>
  );
};

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

    // The search term should be updated in the URL via UrlFiltersProvider
    // We can test this by checking if the input value reflects the typed text
    expect(searchInput).toHaveValue('test');
  });
});
