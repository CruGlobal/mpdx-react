import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { FinancialAccountsWrapper } from 'pages/accountLists/[accountListId]/reports/financialAccounts/Wrapper';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import {
  AccountSummary,
  AppendCategoryToCategoriesArray,
  appendCategoryToCategoriesArray,
} from './AccountSummary';
import {
  creditByCategories,
  defaultFinancialAccountSummary,
} from './AccountSummaryMock';
import { FinancialAccountSummaryQuery } from './financialAccountSummary.generated';

const accountListId = 'accountListId';
const financialAccountId = 'financialAccountId';
const router = {
  query: { accountListId },
  isReady: true,
};
const mutationSpy = jest.fn();

const Component = () => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              FinancialAccountSummary: FinancialAccountSummaryQuery;
            }>
              mocks={{
                FinancialAccountSummary: defaultFinancialAccountSummary,
              }}
              onCall={mutationSpy}
            >
              <FinancialAccountsWrapper>
                <FinancialAccountContext.Provider
                  value={
                    {
                      accountListId,
                      financialAccountId,
                    } as unknown as FinancialAccountType
                  }
                >
                  <AccountSummary />
                </FinancialAccountContext.Provider>
              </FinancialAccountsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('AccountSummary', () => {
  it('regular', async () => {
    const { getByText, findByText } = render(<Component />);

    expect(await findByText('Category')).toBeInTheDocument();
    expect(getByText('Total')).toBeInTheDocument();
    expect(getByText('Opening Balance')).toBeInTheDocument();
    expect(getByText('Income')).toBeInTheDocument();
    expect(getByText('Total Income')).toBeInTheDocument();
    expect(getByText('Expenses')).toBeInTheDocument();
    expect(getByText('Total Expenses')).toBeInTheDocument();
    expect(getByText('Surplus/Deficit')).toBeInTheDocument();
    expect(getByText('Balance')).toBeInTheDocument();
  });

  it('should append the categories to the array', async () => {
    const categoryArray: AppendCategoryToCategoriesArray['categoryArray'] = [];
    appendCategoryToCategoriesArray({
      categories:
        creditByCategories as AppendCategoryToCategoriesArray['categories'],
      categoryArray,
      index: 0,
    });

    expect(categoryArray).toHaveLength(2);
    expect(categoryArray).toEqual([
      {
        id: '111',
        name: 'Category 1',
        amounts: [5000],
      },
      {
        id: '222',
        name: 'Code 2',
        amounts: [5000],
      },
    ]);

    appendCategoryToCategoriesArray({
      categories: [
        {
          ...creditByCategories[0],
          amount: '-3000',
        },
        {
          ...creditByCategories[1],
          amount: '-6000',
        },
      ] as AppendCategoryToCategoriesArray['categories'],
      categoryArray,
      index: 1,
    });

    expect(categoryArray).toHaveLength(2);
    expect(categoryArray).toEqual([
      {
        id: '111',
        name: 'Category 1',
        amounts: [5000, 3000],
      },
      {
        id: '222',
        name: 'Code 2',
        amounts: [5000, 6000],
      },
    ]);
  });

  it('should show correct months', async () => {
    const { getByText, findByText, queryByText } = render(<Component />);

    expect(await findByText('Jan 24')).toBeInTheDocument();
    expect(getByText('Feb 24')).toBeInTheDocument();
    expect(getByText('Mar 24')).toBeInTheDocument();
    expect(queryByText('Apr 24')).not.toBeInTheDocument();
  });

  it('should format number to correctly', async () => {
    const { getByText, findByText } = render(<Component />);
    // Turning '-10001.25' into '10,001'
    expect(await findByText('10,002')).toBeInTheDocument();

    // Turning '5684' to '-5,684'
    expect(getByText('-5,684')).toBeInTheDocument();
  });

  it('should show correct data for Opening Balance', async () => {
    const { getByText, findByText } = render(<Component />);

    expect(await findByText('Opening Balance')).toBeInTheDocument();
    expect(getByText('10,002')).toBeInTheDocument();
    expect(getByText('9,005')).toBeInTheDocument();
    expect(getByText('12,000')).toBeInTheDocument();
    expect(getByText('31,000')).toBeInTheDocument();
  });

  it('should render the categories', async () => {
    const { getByText, findByText } = render(<Component />);

    expect(await findByText('Category 1')).toBeInTheDocument();
    // Should show category code if name is null/undefined
    expect(getByText('Code 2')).toBeInTheDocument();
    expect(getByText('Negative Category 1')).toBeInTheDocument();
    // Should show category code if name is null/undefined
    expect(getByText('Negative Code 2')).toBeInTheDocument();
  });

  it('should show correct data for Total Income', async () => {
    const { getByText, findByText } = render(<Component />);

    expect(await findByText('Total Income')).toBeInTheDocument();
    expect(getByText('5,555')).toBeInTheDocument();
    expect(getByText('6,666')).toBeInTheDocument();
    expect(getByText('3,333')).toBeInTheDocument();
    expect(getByText('14,444')).toBeInTheDocument();
  });

  it('should show correct data for Total Expenses', async () => {
    const { getByText, findByText } = render(<Component />);

    expect(await findByText('Total Expenses')).toBeInTheDocument();
    expect(getByText('2,895')).toBeInTheDocument();
    expect(getByText('1,689')).toBeInTheDocument();
    expect(getByText('2,689')).toBeInTheDocument();
    expect(getByText('5,689')).toBeInTheDocument();
  });

  it('should show correct data for Surplus/Deficit', async () => {
    const { getByText, findByText } = render(<Component />);

    expect(await findByText('Surplus/Deficit')).toBeInTheDocument();
    expect(getByText('-5,684')).toBeInTheDocument();
    expect(getByText('-1,864')).toBeInTheDocument();
    expect(getByText('-3,864')).toBeInTheDocument();
    expect(getByText('-6,864')).toBeInTheDocument();
  });

  it('should show correct data for Balance', async () => {
    const { getByText, findByText } = render(<Component />);

    expect(await findByText('Balance')).toBeInTheDocument();
    expect(getByText('7,000')).toBeInTheDocument();
    expect(getByText('8,000')).toBeInTheDocument();
    expect(getByText('10,000')).toBeInTheDocument();
    expect(getByText('25,000')).toBeInTheDocument();
  });
});
