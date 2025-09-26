import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { Transaction } from '../StaffExpenseReport';
import { DownloadButtonGroup } from './DownloadButtonGroup';

interface TestComponentProps {
  transactions: Transaction[];
}

const TestComponent: React.FC<TestComponentProps> = ({ transactions }) => (
  <ThemeProvider theme={theme}>
    <DownloadButtonGroup transactions={transactions} />
  </ThemeProvider>
);

const mockTransactions: Transaction[] = [
  {
    fundType: 'Income',
    total: 100,
    category: StaffExpenseCategoryEnum.Salary,
    month: '2025-01-01',
  },
  {
    fundType: 'Expense',
    total: -50,
    category: StaffExpenseCategoryEnum.Assessment,
    month: '2025-01-01',
  },
  {
    fundType: 'Income',
    total: 200,
    category: StaffExpenseCategoryEnum.Transfer,
    month: '2025-02-01',
  },
  {
    fundType: 'Expense',
    total: -30,
    category: StaffExpenseCategoryEnum.Benefits,
    month: '2025-02-01',
  },
];

const incomeOnlyTransactions: Transaction[] = [
  {
    total: 100,
    category: StaffExpenseCategoryEnum.Salary,
    month: '2025-01-01',
  } as Transaction,
];

const expenseOnlyTransactions: Transaction[] = [
  {
    total: -50,
    category: StaffExpenseCategoryEnum.Donation,
    month: '2025-01-01',
  } as Transaction,
];

describe('DownloadButtonGroup', () => {
  it('renders a ButtonGroup with three buttons', () => {
    const { getByRole, getByText } = render(
      <TestComponent transactions={mockTransactions} />,
    );

    expect(getByRole('group')).toBeInTheDocument();
    expect(getByText('Income Report')).toBeInTheDocument();
    expect(getByText('Expense Report')).toBeInTheDocument();
    expect(getByText('Combined Report')).toBeInTheDocument();
  });

  it('disables all buttons when transactions are empty', () => {
    const { getByText } = render(<TestComponent transactions={[]} />);

    expect(getByText('Income Report')).toBeDisabled();
    expect(getByText('Expense Report')).toBeDisabled();
    expect(getByText('Combined Report')).toBeDisabled();
  });

  it('disables Income Report button when no income transactions exist', () => {
    const { getByText } = render(
      <TestComponent transactions={expenseOnlyTransactions} />,
    );

    expect(getByText('Income Report')).toBeDisabled();
  });

  it('disables Expense Report button when no expense transactions exist', () => {
    const { getByText } = render(
      <TestComponent transactions={incomeOnlyTransactions} />,
    );

    expect(getByText('Expense Report')).toBeDisabled();
  });

  it('disables Combined Report button when only income transactions exist', () => {
    const { getByText } = render(
      <TestComponent transactions={incomeOnlyTransactions} />,
    );

    expect(getByText('Combined Report')).toBeDisabled();
  });

  it('disables Combined Report button when only expense transactions exist', () => {
    const { getByText } = render(
      <TestComponent transactions={expenseOnlyTransactions} />,
    );

    expect(getByText('Combined Report')).toBeDisabled();
  });

  it('enables all buttons when both income and expense transactions exist', () => {
    const { getByText } = render(
      <TestComponent transactions={mockTransactions} />,
    );

    expect(getByText('Income Report')).not.toBeDisabled();
    expect(getByText('Expense Report')).not.toBeDisabled();
    expect(getByText('Combined Report')).not.toBeDisabled();
  });

  it('disables Combined Report button when the expected transactions do not exist', () => {
    const { getByText } = render(
      <TestComponent transactions={incomeOnlyTransactions} />,
    );

    const combinedButton = getByText('Combined Report');
    expect(combinedButton).toBeDisabled();
  });

  it('handles transactions with zero amounts correctly', () => {
    const transactionsWithZero = [
      {
        total: 0,
        category: StaffExpenseCategoryEnum.Transfer,
        month: '2025-01-01',
      } as Transaction,
      {
        total: 100,
        category: StaffExpenseCategoryEnum.Salary,
        month: '2025-01-01',
      } as Transaction,
    ];

    const { getByText } = render(
      <TestComponent transactions={transactionsWithZero} />,
    );

    expect(getByText('Income Report')).not.toBeDisabled();
    expect(getByText('Expense Report')).toBeDisabled();
    expect(getByText('Combined Report')).toBeDisabled();
  });
});
