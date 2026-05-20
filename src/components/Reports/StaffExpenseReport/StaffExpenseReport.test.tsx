import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from 'luxon';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { StaffAccountQuery } from 'src/components/Shared/StaffAccount/StaffAccount.generated';
import {
  StaffAccountStatusEnum,
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ReportsStaffExpensesQuery } from './GetStaffExpense.generated';
import { StaffExpenseReport } from './StaffExpenseReport';

interface TestComponentProps {
  isEmpty?: boolean;
  routerMonth?: string;
}

const mutationSpy = jest.fn();
const onNavListToggle = jest.fn();
const push = jest.fn();

const title = 'Report title';

const router = {
  isReady: true,
  push,
};

const TestComponent: React.FC<TestComponentProps> = ({
  isEmpty,
  routerMonth,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={
        routerMonth
          ? {
              ...router,
              query: { month: '2025-01-01' },
            }
          : router
      }
    >
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              ReportsStaffExpenses: ReportsStaffExpensesQuery;
              StaffAccount: StaffAccountQuery;
            }>
              mocks={{
                ReportsStaffExpenses: {
                  reportsStaffExpenses: {
                    funds: isEmpty
                      ? []
                      : [
                          {
                            fundType: 'Primary',
                            total: -500,
                            startBalance: 1000,
                            endBalance: 2000,
                            categories: [
                              {
                                category: StaffExpenseCategoryEnum.Assessment,
                                total: -300,
                                averagePerMonth: -100,
                                subcategories: [
                                  {
                                    subCategory:
                                      StaffExpensesSubCategoryEnum.BenefitsOther,
                                    total: -200,
                                    averagePerMonth: -50,
                                    breakdownByMonth: [
                                      {
                                        month: '2020-01-01',
                                        total: -200,
                                        transactions: [
                                          {
                                            id: 'transaction-1',
                                            amount: -100,
                                            transactedAt: '2020-01-15',
                                            description: 'Star Wars Costume',
                                          },
                                          {
                                            id: 'transaction-2',
                                            amount: -100,
                                            transactedAt: '2020-01-24',
                                          },

                                          {
                                            id: 'transaction-3',
                                            amount: 50,
                                            transactedAt: '2020-02-15',
                                            description: 'Credit Card Fee',
                                          },
                                        ],
                                      },
                                      {
                                        month: '2020-02-01',
                                        total: -100,
                                      },
                                    ],
                                  },
                                  {
                                    subCategory:
                                      StaffExpensesSubCategoryEnum.CreditCardFee,
                                    total: 150,
                                    averagePerMonth: 75,
                                    breakdownByMonth: [
                                      {
                                        month: '2020-01-01',
                                        total: 50,
                                      },
                                      {
                                        month: '2020-02-01',
                                        total: 50,
                                        transactions: [
                                          {
                                            id: 'transaction-3',
                                            amount: 50,
                                            transactedAt: '2020-02-15',
                                            description: 'Credit Card Fee',
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                                breakdownByMonth: [
                                  {
                                    month: '2020-01-01',
                                    total: -150,
                                  },
                                  {
                                    month: '2020-02-01',
                                    total: -150,
                                  },
                                ],
                              },
                            ],
                          },
                          {
                            fundType: 'Savings',
                            total: -100,
                            startBalance: 1000,
                            endBalance: 2000,
                            categories: [
                              {
                                category: StaffExpenseCategoryEnum.Assessment,
                                total: -100,
                                averagePerMonth: -50,
                                subcategories: [
                                  {
                                    subCategory:
                                      StaffExpensesSubCategoryEnum.BenefitsOther,
                                    total: -100,
                                    averagePerMonth: -50,
                                    breakdownByMonth: [
                                      {
                                        month: '2020-01-01',
                                        total: -100,
                                        transactions: [
                                          {
                                            id: 'transaction-savings-1',
                                            amount: -100,
                                            transactedAt: '2020-01-10',
                                            description: 'Savings Expense',
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                                breakdownByMonth: [
                                  {
                                    month: '2020-01-01',
                                    total: -100,
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                  },
                },
                StaffAccount: {
                  staffAccount: {
                    id: '1000000001',
                    name: 'Test Account',
                    status: StaffAccountStatusEnum.Active,
                  },
                },
              }}
              onCall={mutationSpy}
            >
              <StaffExpenseReport
                isNavListOpen={true}
                onNavListToggle={onNavListToggle}
                title={title}
              />
            </GqlMockedProvider>
          </TestRouter>
        </LocalizationProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('StaffExpenseReport', () => {
  it('renders with data', async () => {
    const { getByRole, findByText } = render(<TestComponent isEmpty={false} />);

    expect(getByRole('heading', { name: 'Report title' })).toBeInTheDocument();
    expect(await findByText('Test Account')).toBeInTheDocument();
    expect(await findByText('1000000001')).toBeInTheDocument();
  });

  it('initializes with month from query', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('January 2020')).toBeInTheDocument();
  });

  it('renders nav list icon and onclick triggers onNavListToggle', async () => {
    onNavListToggle.mockClear();
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ReportsMenuIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsMenuIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });

  it('updates the time filter', () => {
    const { getByRole, getByText } = render(<TestComponent />);
    userEvent.click(getByRole('button', { name: 'Previous Month' }));
    expect(getByText('December 2019')).toBeInTheDocument();
  });

  it('correctly displays totals for income and expenses', async () => {
    const { getAllByRole, queryByRole } = render(<TestComponent />);

    // Header row and 2 expense transaction rows
    await waitFor(() => {
      expect(getAllByRole('row')).toHaveLength(3);
    });

    expect(queryByRole('heading', { name: 'Income' })).not.toBeInTheDocument();
  });

  it('switches fund display when clicking View Account button', async () => {
    const { findByRole, findByText, getAllByRole } = render(<TestComponent />);

    await findByRole('heading', { name: 'Primary' });
    expect(await findByText('Currently Viewing')).toBeInTheDocument();

    waitFor(() => {
      expect(getAllByRole('row')).toHaveLength(3);
    });

    userEvent.click(
      await findByRole('button', {
        name: 'View Account',
      }),
    );

    waitFor(() => {
      expect(getAllByRole('row')).toHaveLength(2);
    });
  });

  it('shows month title and navigation when only category filters are applied', async () => {
    const { getByRole, findByRole, findByLabelText, queryByText } = render(
      <TestComponent />,
    );

    userEvent.click(getByRole('button', { name: 'Filter Settings' }));

    userEvent.click(await findByLabelText('Assessment'));
    userEvent.click(await findByRole('button', { name: 'Apply Filters' }));

    expect(
      await findByRole('heading', { name: 'January 2020', level: 6 }),
    ).toBeInTheDocument();
    expect(
      await findByRole('button', { name: 'Previous Month' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('button', { name: 'Next Month' }),
    ).toBeInTheDocument();
    expect(queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  it('shows filter date range title and hides month navigation when date filters are applied', async () => {
    const originalNow = Settings.now;
    Settings.now = () => new Date(2020, 0, 20).valueOf();

    const { getByRole, findByRole, getByLabelText, queryByRole } = render(
      <TestComponent />,
    );

    userEvent.click(getByRole('button', { name: 'Filter Settings' }));
    await findByRole('heading', { name: 'Report Settings' });

    userEvent.click(getByLabelText('Select Date Range'));
    userEvent.click(getByRole('option', { name: 'Month to Date' }));

    await waitFor(() =>
      expect(getByRole('button', { name: 'Apply Filters' })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    expect(
      await findByRole('heading', {
        level: 6,
        name: 'January 1, 2020 - January 20, 2020',
      }),
    ).toBeInTheDocument();

    expect(
      queryByRole('button', { name: 'Previous Month' }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Next Month' }),
    ).not.toBeInTheDocument();

    Settings.now = originalNow;
  }, 10000);
});
