import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ReportType } from '../Helpers/StaffReportEnum';
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

const defaultTransactions = [
  {
    id: '1',
    fundType: 'Primary',
    category: StaffExpenseCategoryEnum.AdditionalSalary,
    transactedAt: '2025-01-01',
    amount: -100,
    displayCategory: 'Additional Salary',
  },
  {
    id: '2',
    fundType: 'Primary',
    category: StaffExpenseCategoryEnum.Transfer,
    transactedAt: '2025-02-01',
    amount: -50,
    displayCategory: 'Transfer',
  },
];

const groupedTransaction = {
  id: 'grouped-2',
  fundType: 'Primary',
  category: StaffExpenseCategoryEnum.Benefits,
  displayCategory: 'Benefits',
  transactedAt: '2025-01-20',
  amount: -300,
  categoryName: 'Benefits',
  groupedTransactions: [defaultTransactions[1]],
};

const TestComponent: React.FC<TestComponentProps> = ({ tableProps }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <StaffReportTable
        transactions={defaultTransactions}
        tableType={ReportType.Expense}
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
        tableType={ReportType.Expense}
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

  it('opens breakdown dialog when info button is clicked for grouped transaction', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent
        tableProps={{
          transactions: [...defaultTransactions, groupedTransaction],
        }}
      />,
    );

    const infoButton = await findByRole('button', { name: 'View breakdown' });
    userEvent.click(infoButton);

    await waitFor(() => {
      expect(getByRole('dialog', { hidden: true })).toBeInTheDocument();
      expect(
        getByRole('heading', { name: 'Benefits Breakdown', hidden: true }),
      ).toBeInTheDocument();
    });
  });

  it('closes breakdown dialog when close is triggered', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <TestComponent
        tableProps={{
          transactions: [...defaultTransactions, groupedTransaction],
        }}
      />,
    );

    userEvent.click(await findByRole('button', { name: 'View breakdown' }));
    await waitFor(() => {
      expect(getByRole('dialog', { hidden: true })).toBeInTheDocument();
    });

    userEvent.click(getByRole('button', { name: 'Close', hidden: true }));
    await waitFor(() => {
      expect(queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
    });
  });

  it('does not show info button for non-grouped transactions', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    await findByRole('columnheader', { name: 'Date' });

    expect(
      queryByRole('button', { name: 'View breakdown' }),
    ).not.toBeInTheDocument();
  });
});
