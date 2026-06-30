import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ReportType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../Helpers/filterTransactions';
import { ExportCsvButton } from './ExportCsvButton';
import { createCsvReport } from './downloadReport';

jest.mock('./downloadReport', () => ({
  createCsvReport: jest.fn(),
}));

interface TestComponentProps {
  transactions: Transaction[];
}

const TestComponent: React.FC<TestComponentProps> = ({ transactions }) => (
  <ThemeProvider theme={theme}>
    <ExportCsvButton transactions={transactions} />
  </ThemeProvider>
);

const mockTransactions: Transaction[] = [
  {
    id: '1',
    fundType: 'Income',
    amount: 100,
    category: StaffExpenseCategoryEnum.Salary,
    transactedAt: '2025-01-01',
    displayCategory: 'Salary',
  },
  {
    id: '2',
    fundType: 'Expense',
    amount: -50,
    category: StaffExpenseCategoryEnum.Assessment,
    transactedAt: '2025-01-01',
    displayCategory: 'Assessment',
  },
];

const incomeOnlyTransactions: Transaction[] = [mockTransactions[0]];
const expenseOnlyTransactions: Transaction[] = [mockTransactions[1]];

describe('ExportCsvButton', () => {
  beforeEach(() => {
    (createCsvReport as jest.Mock).mockClear();
  });

  it('renders an Export CSV button', () => {
    const { getByRole } = render(
      <TestComponent transactions={mockTransactions} />,
    );

    expect(getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
  });

  it('disables the button when there are no transactions', () => {
    const { getByRole } = render(<TestComponent transactions={[]} />);

    expect(getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  });

  it('opens a menu with Income, Expense, and Combined options when clicked', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent transactions={mockTransactions} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Income Report' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('menuitem', { name: 'Expense Report' }),
    ).toBeInTheDocument();
    expect(
      await findByRole('menuitem', { name: 'Combined Report' }),
    ).toBeInTheDocument();
  });

  it('exports only income transactions when Income Report is selected', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent transactions={mockTransactions} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Income Report' }));

    expect(createCsvReport).toHaveBeenCalledWith(
      ReportType.Income,
      incomeOnlyTransactions,
      expect.any(Function),
      'en-US',
    );
  });

  it('exports only expense transactions when Expense Report is selected', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent transactions={mockTransactions} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Expense Report' }));

    expect(createCsvReport).toHaveBeenCalledWith(
      ReportType.Expense,
      expenseOnlyTransactions,
      expect.any(Function),
      'en-US',
    );
  });

  it('exports all transactions when Combined Report is selected', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent transactions={mockTransactions} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Combined Report' }));

    expect(createCsvReport).toHaveBeenCalledWith(
      ReportType.Combined,
      mockTransactions,
      expect.any(Function),
      'en-US',
    );
  });

  it('disables the Income Report option when no income transactions exist', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent transactions={expenseOnlyTransactions} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Income Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables the Expense Report option when no expense transactions exist', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent transactions={incomeOnlyTransactions} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Expense Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables the Combined Report option when only one transaction type exists', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent transactions={incomeOnlyTransactions} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Combined Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('treats a zero-amount transaction as neither income nor expense', async () => {
    const zeroTransaction: Transaction = {
      ...mockTransactions[0],
      id: '0',
      amount: 0,
    };
    const { getByRole, findByRole } = render(
      <TestComponent
        transactions={[zeroTransaction, ...incomeOnlyTransactions]}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));

    expect(
      await findByRole('menuitem', { name: 'Income Report' }),
    ).not.toHaveAttribute('aria-disabled', 'true');
    expect(
      await findByRole('menuitem', { name: 'Expense Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      await findByRole('menuitem', { name: 'Combined Report' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('closes the menu after an export is selected', async () => {
    const { getByRole, findByRole, queryByRole } = render(
      <TestComponent transactions={mockTransactions} />,
    );

    userEvent.click(getByRole('button', { name: 'Export CSV' }));
    userEvent.click(await findByRole('menuitem', { name: 'Income Report' }));

    await waitFor(() =>
      expect(
        queryByRole('menuitem', { name: 'Income Report' }),
      ).not.toBeInTheDocument(),
    );
  });
});
