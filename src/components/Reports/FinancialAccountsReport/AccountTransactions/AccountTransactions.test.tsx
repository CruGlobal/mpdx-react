import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Settings } from 'luxon';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  FinancialAccountTransactionFilters,
  FinancialAccountsWrapper,
} from 'pages/accountLists/[accountListId]/reports/financialAccounts/[financialAccountId]/Wrapper';
import { Panel } from 'pages/accountLists/[accountListId]/reports/helpers';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { FinancialAccountQuery } from '../Context/FinancialAccount.generated';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import { defaultFinancialAccount } from '../Header/HeaderMocks';
import { AccountTransactions } from './AccountTransactions';
import { financialAccountEntriesMock } from './AccountTransactionsMocks';
import { FinancialAccountEntriesQuery } from './financialAccountTransactions.generated';

const accountListId = 'account-list-1';
const financialAccountId = 'financialAccountId';
const defaultSearchTerm = '';
const setActiveFilters = jest.fn();
const setPanelOpen = jest.fn();
const defaultActiveFilters = {};
const defaultRouter = {
  query: { accountListId },
  isReady: true,
};
const mutationSpy = jest.fn();

interface ComponentsProps {
  activeFilters?: FinancialAccountTransactionFilters;
  searchTerm?: string;
  router?: object;
}

const Components = ({
  searchTerm = defaultSearchTerm,
  activeFilters = defaultActiveFilters,
  router = defaultRouter,
}: ComponentsProps) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              FinancialAccount: FinancialAccountQuery;
              FinancialAccountEntries: FinancialAccountEntriesQuery;
            }>
              mocks={{
                FinancialAccount: defaultFinancialAccount,
                FinancialAccountEntries: financialAccountEntriesMock,
              }}
              onCall={mutationSpy}
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
                      hasActiveFilters: false,
                      setActiveFilters,
                      setPanelOpen,
                      searchTerm,
                      activeFilters,
                    } as unknown as FinancialAccountType
                  }
                >
                  <AccountTransactions />
                </FinancialAccountContext.Provider>
              </FinancialAccountsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('Financial Account Transactions', () => {
  beforeEach(() => {
    Settings.now = () => new Date(2024, 7, 31).valueOf();
  });
  describe('Resetting filters', () => {
    it('should reset the activeFilters with the filters from the url filters', () => {
      render(
        <Components
          activeFilters={{ categoryId: 'test123' }}
          router={{
            ...defaultRouter,
            query: {
              ...defaultRouter.query,
              filters: '{"categoryId":"newCategoryId"}',
            },
          }}
        />,
      );

      expect(setActiveFilters).not.toHaveBeenCalledWith({
        dateRange: {
          min: '2024-08-01',
          max: '2024-08-31',
        },
      });

      expect(setActiveFilters).toHaveBeenCalledWith({
        categoryId: 'newCategoryId',
      });
      expect(setPanelOpen).toHaveBeenCalledWith(Panel.Filters);
    });

    it('should set filters to default date range if no activeFilters or url filters', () => {
      render(<Components />);

      expect(setActiveFilters).toHaveBeenCalledWith({
        dateRange: {
          min: '2024-08-01',
          max: '2024-08-31',
        },
      });
    });
  });

  it('should render data correctly', async () => {
    const { findAllByText, getAllByText, getByText } = render(<Components />);

    expect(await findAllByText('category1Name')).toHaveLength(2);
    expect(getAllByText('category1Code')).toHaveLength(2);

    // Header
    expect(getByText('8/31/2024')).toBeInTheDocument();
    expect(getByText('Closing Balance')).toBeInTheDocument();
    expect(getByText('UAH 280,414')).toBeInTheDocument();

    // Row 1
    expect(getByText('8/9/2024')).toBeInTheDocument();
    expect(getByText('description3')).toBeInTheDocument();
    expect(getByText('code3')).toBeInTheDocument();
    expect(getByText('UAH 7,048')).toBeInTheDocument();

    // Row 2
    expect(getByText('8/8/2024')).toBeInTheDocument();
    expect(getByText('description1')).toBeInTheDocument();
    expect(getByText('code1')).toBeInTheDocument();
    expect(getByText('UAH 15,008')).toBeInTheDocument();

    // Row 3
    expect(getByText('8/7/2024')).toBeInTheDocument();
    expect(getByText('description2')).toBeInTheDocument();
    expect(getByText('code2')).toBeInTheDocument();
    expect(getByText('UAH 37')).toBeInTheDocument();

    // Footer
    expect(getByText('8/1/2024')).toBeInTheDocument();
    expect(getByText('Opening Balance')).toBeInTheDocument();
    expect(getByText('UAH 202,240')).toBeInTheDocument();

    // Totals
    expect(getByText('Income:')).toBeInTheDocument();
    expect(getByText('UAH 307,519')).toBeInTheDocument();

    expect(getByText('Expenses:')).toBeInTheDocument();
    expect(getByText('UAH 229,344')).toBeInTheDocument();

    expect(getByText('Differences:')).toBeInTheDocument();
    expect(getByText('UAH 78,175')).toBeInTheDocument();
  });

  it('should render closing and opening dates correctly when using filtered dates', async () => {
    const { getByText, findByText } = render(
      <Components
        activeFilters={{
          dateRange: {
            min: '2024-08-01',
            max: '2024-09-30',
          },
        }}
      />,
    );

    // Closing balance date
    expect(await findByText('8/1/2024')).toBeInTheDocument();
    // Opening balance date
    expect(getByText('9/30/2024')).toBeInTheDocument();
  });

  describe('GraphQL query variables', () => {
    it('should use date filters', async () => {
      render(
        <Components
          activeFilters={{
            dateRange: {
              min: '2024-08-01',
              max: '2024-09-30',
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('FinancialAccountEntries', {
          input: {
            accountListId,
            financialAccountId,
            dateRange: '2024-08-01..2024-09-30',
            categoryId: '',
            wildcardSearch: '',
          },
        });
      });
    });

    it('should use date and category filters', async () => {
      render(
        <Components
          activeFilters={{
            dateRange: {
              min: '2024-08-01',
              max: '2024-09-30',
            },
            categoryId: 'test123',
          }}
        />,
      );

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('FinancialAccountEntries', {
          input: {
            accountListId,
            financialAccountId,
            dateRange: '2024-08-01..2024-09-30',
            categoryId: 'test123',
            wildcardSearch: '',
          },
        });
      });
    });

    it('should use date, category and search filters', async () => {
      render(
        <Components
          activeFilters={{
            dateRange: {
              min: '2024-08-01',
              max: '2024-09-30',
            },
            categoryId: 'test123',
          }}
          searchTerm="searchTerm"
        />,
      );

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('FinancialAccountEntries', {
          input: {
            accountListId,
            financialAccountId,
            dateRange: '2024-08-01..2024-09-30',
            categoryId: 'test123',
            wildcardSearch: 'searchTerm',
          },
        });
      });
    });
  });

  describe('Export CSV', () => {
    it('should disable export CSV button when loading', async () => {
      const { getByRole } = render(<Components />);

      expect(getByRole('button', { name: 'Export CSV' })).toBeDisabled();

      await waitFor(() => {
        expect(getByRole('button', { name: 'Export CSV' })).toBeEnabled();
      });
    });

    it('should export CSV', async () => {
      const { getByRole } = render(<Components />);

      await waitFor(() => {
        expect(getByRole('button', { name: 'Export CSV' })).toBeEnabled();
      });

      const link = document.createElement('a');

      const createElementSpy = jest.spyOn(document, 'createElement');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      const removeChildSpy = jest.spyOn(document.body, 'removeChild');
      const clickSpy = jest.fn();
      const setAttributeSpy = jest.fn();

      link.setAttribute = setAttributeSpy;
      link.click = clickSpy;

      createElementSpy.mockReturnValue(link);

      fireEvent.click(getByRole('button', { name: 'Export CSV' }));

      const csvContentArray = [
        ['Date', 'Payee', 'Memo', 'Outflow', 'Inflow'],
        ['8/9/2024', 'description1', 'category1Name', '', '7047.28'],
        ['8/8/2024', 'description2', 'category1Name', '15008', ''],
        ['8/7/2024', 'description3', 'category2Name', '', '36.2'],
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        csvContentArray
          .map((row) =>
            row
              .map((field) => `"${String(field).replace(/"/g, '""')}"`)
              .join(','),
          )
          .join('\n');

      await waitFor(() => {
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(appendChildSpy).toHaveBeenCalled();
        expect(setAttributeSpy).toHaveBeenCalledWith(
          'href',
          encodeURI(csvContent),
        );
        expect(clickSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();
      });

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
