import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ReportsStaffExpensesQuery } from '../GetStaffExpense.generated';
import { TableType } from '../Helpers/StaffReportEnum';
import { StaffReportTable, StaffReportTableProps } from './StaffReportTable';

const mutationSpy = jest.fn();

const router = {
  pathname: '/accountLists/[accountListId]/reports/staffExpense',
  query: { accountListId: 'account-list-1' },
  isReady: true,
};

interface TestComponentProps {
  isEmpty?: boolean;
  tableProps?: Partial<StaffReportTableProps>;
}

const TestComponent: React.FC<TestComponentProps> = ({
  tableProps,
  isEmpty,
}) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
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
              funds: isEmpty
                ? []
                : [
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
                            {
                              subCategory: 'Hotels',
                              total: -100,
                              averagePerMonth: -50,
                              breakdownByMonth: [
                                { month: '2025-01-01', total: -50 },
                                { month: '2025-02-01', total: -50 },
                              ],
                            },
                          ],
                          breakdownByMonth: [
                            { month: '2025-01-01', total: -150 },
                            { month: '2025-02-01', total: -150 },
                          ],
                        },
                      ],
                    },
                  ],
            },
          }}
          onCall={mutationSpy}
        >
          <StaffReportTable
            transactions={[
              {
                fundType: 'Primary',
                category: 'Travel - Flights',
                month: '2025-01-01',
                total: -100,
              },
              {
                fundType: 'Primary',
                category: 'Travel - Hotels',
                month: '2025-02-01',
                total: -50,
              },
            ]}
            tableType={TableType.Expenses}
            transferTotal={0}
            emptyPlaceholder={<span>Empty Table</span>}
            {...tableProps}
          />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  </LocalizationProvider>
);

describe('StaffReportTable', () => {
  it('renders with transactions', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('columnheader', { name: 'Date' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '1/1/2025' })).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Description' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Travel - Flights' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '-$100.00' })).toBeInTheDocument();
  });

  it('renders loading spinner when loading prop is true', async () => {
    const { findByTestId } = render(
      <TestComponent tableProps={{ loading: true }} />,
    );

    expect(await findByTestId('loading-spinner')).toBeInTheDocument();
    await waitFor(() => {
      expect(mutationSpy).not.toHaveGraphqlOperation('ReportsStaffExpenses');
    });
  });

  it('renders empty table', async () => {
    const { findByText } = render(
      <StaffReportTable
        transactions={[]}
        tableType={TableType.Expenses}
        transferTotal={0}
        emptyPlaceholder={<span>Empty Table</span>}
      />,
    );
    expect(await findByText('Empty Table')).toBeInTheDocument();
  });

  it('updates the sort order', async () => {
    const { getAllByRole, findByRole } = render(<TestComponent />);

    const dateHeader = await findByRole('columnheader', { name: 'Date' });
    expect(
      within(dateHeader).getByTestId('ArrowDownwardIcon'),
    ).toBeInTheDocument();

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const ascCells = getAllByRole('cell', { name: /-\$\d+\.\d{2}/ });
    expect(ascCells[0]).toHaveTextContent('-$50.00');
    expect(ascCells[1]).toHaveTextContent('-$100.00');

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const descCells = getAllByRole('cell', { name: /-\$\d+\.\d{2}/ });
    expect(descCells[0]).toHaveTextContent('-$100.00');
    expect(descCells[1]).toHaveTextContent('-$50.00');
  });

  it('updates the page size without reloading data', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('combobox', { name: 'Rows per page:' }));
    userEvent.click(getByRole('option', { name: '10' }));

    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation('DonationTable', {
        pageSize: 10,
      }),
    );
  });
});
