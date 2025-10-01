import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  StaffAccountStatusEnum,
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffAccountQuery } from '../StaffAccount.generated';
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
                    startBalance: 1000,
                    endBalance: 2000,
                    funds: isEmpty
                      ? []
                      : [
                          {
                            fundType: 'Primary',
                            total: -500,
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
                                        month: '2025-01-01',
                                        total: -100,
                                      },
                                      {
                                        month: '2025-02-01',
                                        total: -100,
                                      },
                                    ],
                                  },
                                  {
                                    subCategory:
                                      StaffExpensesSubCategoryEnum.CreditCardFee,
                                    total: -100,
                                    averagePerMonth: -50,
                                    breakdownByMonth: [
                                      {
                                        month: '2025-01-01',
                                        total: -50,
                                      },
                                      {
                                        month: '2025-02-01',
                                        total: -50,
                                      },
                                    ],
                                  },
                                ],
                                breakdownByMonth: [
                                  {
                                    month: '2025-01-01',
                                    total: -150,
                                  },
                                  {
                                    month: '2025-02-01',
                                    total: -150,
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

    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsFilterIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });

  it('updates the time filter', () => {
    const { getByRole, getByText } = render(<TestComponent />);
    userEvent.click(getByRole('button', { name: 'Previous Month' }));
    expect(getByText('December 2019')).toBeInTheDocument();
  });
});
