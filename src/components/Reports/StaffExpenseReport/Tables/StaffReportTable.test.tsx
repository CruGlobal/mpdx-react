import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
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

const TestComponent: React.FC<TestComponentProps> = ({ tableProps }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <StaffReportTable
        transactions={[
          {
            fundType: 'Primary',
            category: StaffExpenseCategoryEnum.AdditionalSalary,
            month: '2025-01-01',
            total: -100,
            displayCategory: 'Additional Salary',
          },
          {
            fundType: 'Primary',
            category: StaffExpenseCategoryEnum.Transfer,
            month: '2025-02-01',
            total: -50,
            displayCategory: 'Transfer',
          },
        ]}
        tableType={TableType.Expenses}
        transferTotal={0}
        emptyPlaceholder={<span>Empty Table</span>}
        {...tableProps}
      />
    </TestRouter>
  </ThemeProvider>
);

describe('StaffReportTable', () => {
  it('renders with transactions', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('columnheader', { name: 'Date' }),
    ).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Jan 1, 2025' })).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Description' }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', {
        name: 'Additional Salary',
      }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '-$100' })).toBeInTheDocument();
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
    const ascCells = getAllByRole('gridcell', { name: /-\$\d/ });
    expect(ascCells[0]).toHaveTextContent('-$50');
    expect(ascCells[1]).toHaveTextContent('-$100');

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const descCells = getAllByRole('gridcell', { name: /-\$\d/ });
    expect(descCells[0]).toHaveTextContent('-$100');
    expect(descCells[1]).toHaveTextContent('-$50');
  });

  it('updates the page size without reloading data', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('combobox', { name: 'Rows per page:' }));
    userEvent.click(getByRole('option', { name: '10' }));

    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation('ReportsStaffExpenses', {
        pageSize: 10,
      }),
    );
  });
});
