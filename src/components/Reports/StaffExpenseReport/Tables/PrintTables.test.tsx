import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ReportsStaffExpensesQuery } from '../GetStaffExpense.generated';
import { TableType } from '../Helpers/StaffReportEnum';
import { PrintTables, PrintTablesProps } from './PrintTables';

const mutationSpy = jest.fn();

interface TestComponentProps {
  tableProps?: Partial<PrintTablesProps>;
}

const TestComponent: React.FC<TestComponentProps> = ({ tableProps }) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      StaffExpenseReport: ReportsStaffExpensesQuery;
    }>
      mocks={{
        reportsStaffExpenses: {
          accountId: 'account-1',
          name: 'Test Account',
          status: 'active',
          startBalance: 1000,
          endBalance: 2000,
          funds: [
            {
              fundType: 'Primary',
              total: -500,
              categories: [
                {
                  category: 'Travel',
                  total: -300,
                  averagePerMonth: -100,
                  subcategories: [
                    {
                      subCategory: 'Flights',
                      total: -200,
                      averagePerMonth: -50,
                      breakdownByMonth: [
                        { month: '2025-01-01', total: -100 },
                        { month: '2025-02-01', total: -100 },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      }}
      onCall={mutationSpy}
    >
      <PrintTables
        transactions={[
          {
            fundType: 'Primary',
            month: '2025-01-01',
            category: 'Travel - Flights',
            total: -100,
          },
        ]}
        transactionTotal={0}
        type={TableType.Expenses}
        {...tableProps}
      />
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('PrintTables', () => {
  it('renders the table data', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('columnheader', { name: 'Date' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '2025-01-01' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Description' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Travel - Flights' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Amount' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '-$100' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Total' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '$0' })).toBeInTheDocument();
  });

  it('renders empty table message when no transactions', async () => {
    const { getByText } = render(
      <PrintTables
        transactions={[]}
        transactionTotal={0}
        type={TableType.Expenses}
      />,
    );

    expect(getByText('No Expense Transactions Found')).toBeInTheDocument();
  });
});
