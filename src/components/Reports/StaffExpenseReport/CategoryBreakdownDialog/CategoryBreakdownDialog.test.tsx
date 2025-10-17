import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    subcategory: StaffExpensesSubCategoryEnum.SalaryOther,
    displayCategory: 'Salary - Salary Other',
  },
  {
    id: 'transaction-2',
    amount: 300,
    transactedAt: '2025-01-20',
    description: 'Salary Payment 2',
    fundType: 'Primary',
    category: StaffExpenseCategoryEnum.Salary,
    subcategory: StaffExpensesSubCategoryEnum.SalaryOther,
    displayCategory: 'Salary - Salary Other',
  },
];

const defaultProps: CategoryBreakdownDialogProps = {
  isOpen: true,
  onClose: jest.fn(),
  categoryName: 'Salary',
  transactions: mockTransactions,
  totalAmount: 800,
};

const mutationSpy = jest.fn();

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
  it('renders dialog when isOpen is true', () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);

    expect(getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render dialog when isOpen is false', () => {
    const { queryByRole } = render(
      <TestComponent {...defaultProps} isOpen={false} />,
    );

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays all transactions', () => {
    const { getByRole, getAllByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(
      getAllByRole('cell', {
        name: 'Salary - Salary Other',
      }),
    ).toHaveLength(2);

    expect(getByRole('cell', { name: '$500' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '$300' })).toBeInTheDocument();
  });

  it('displays total amount', () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);

    expect(
      getByRole('cell', { name: 'Total Salary Income' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '$800' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const { getByTestId } = render(
      <TestComponent {...defaultProps} onClose={mutationSpy} />,
    );

    userEvent.click(getByTestId('close-button'));
    expect(mutationSpy).toHaveBeenCalled();
  });
});
