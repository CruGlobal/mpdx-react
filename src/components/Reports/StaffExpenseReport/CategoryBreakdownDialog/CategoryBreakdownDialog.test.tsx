import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, within } from '@testing-library/react';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { Transaction } from '../Helpers/filterTransactions';
import {
  CategoryBreakdownDialog,
  CategoryBreakdownDialogProps,
} from './CategoryBreakdownDialog';

const mockTransactions: Transaction[] = [
  {
    id: 'transaction-1',
    amount: 500,
    transactedAt: '2025-01-15',
    description: 'Salary Payment 1',
    fundType: 'Primary',
    category: StaffExpenseCategoryEnum.Salary,
    subcategory: StaffExpensesSubCategoryEnum.Bereavement,
    displayCategory: 'Salary - Bereavement',
  },
  {
    id: 'transaction-2',
    amount: 300,
    transactedAt: '2025-01-20',
    description: 'Salary Payment 2',
    fundType: 'Primary',
    category: StaffExpenseCategoryEnum.Salary,
    subcategory: StaffExpensesSubCategoryEnum.Bonuses,
    displayCategory: 'Salary - Bonuses',
  },
];

const defaultProps: CategoryBreakdownDialogProps = {
  isOpen: true,
  onClose: jest.fn(),
  categoryName: 'Salary',
  transactions: mockTransactions,
  totalAmount: 800,
};

const TestComponent: React.FC<CategoryBreakdownDialogProps> = (
  defaultProps,
) => {
  return (
    <ThemeProvider theme={theme}>
      <CategoryBreakdownDialog {...defaultProps} />
    </ThemeProvider>
  );
};

describe('CategoryBreakdownDialog', () => {
  it('displays all transactions', () => {
    const { getByRole, getAllByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(
      getAllByRole('cell', {
        name: 'Salary - Bereavement',
      }),
    ).toHaveLength(1);

    expect(getByRole('cell', { name: '$500' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '$300' })).toBeInTheDocument();
  });

  it('renders four column headers including Category', () => {
    const { getAllByRole, getByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(getAllByRole('columnheader')).toHaveLength(4);
    expect(getByRole('columnheader', { name: 'Date' })).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Description' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
  });

  it('displays the transaction description in its own column', () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);

    expect(getByRole('cell', { name: 'Salary Payment 1' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Salary Payment 2' })).toBeInTheDocument();
  });

  it('places description and Category in separate, adjacent columns', () => {
    const { getAllByRole } = render(<TestComponent {...defaultProps} />);

    // rows[0] is the header; rows[1] is the first sorted transaction.
    const firstRowCells = within(getAllByRole('row')[1]).getAllByRole('cell');
    // Columns: Date | Description | Category | Amount
    expect(firstRowCells[1]).toHaveTextContent('Salary Payment 1');
    expect(firstRowCells[2]).toHaveTextContent('Salary - Bereavement');
  });

  it('displays total amount', () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);

    expect(
      getByRole('cell', { name: 'Total Salary Income' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '$800' })).toBeInTheDocument();
  });

  it('displays expense amounts as positive magnitudes', () => {
    const expenseTransactions: Transaction[] = mockTransactions.map(
      (transaction) => ({ ...transaction, amount: -transaction.amount }),
    );
    const { getByRole, queryByRole } = render(
      <TestComponent
        {...defaultProps}
        transactions={expenseTransactions}
        totalAmount={-800}
      />,
    );

    expect(getByRole('cell', { name: '$500' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '$300' })).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'Total Salary Expense' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '$800' })).toBeInTheDocument();
    expect(queryByRole('cell', { name: '-$800' })).not.toBeInTheDocument();
  });
});
