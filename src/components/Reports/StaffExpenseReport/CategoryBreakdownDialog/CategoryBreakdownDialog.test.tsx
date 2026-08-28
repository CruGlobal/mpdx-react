import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, within } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
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

const userPersonNumber = '000123456';
const spousePersonNumber = '000789123';

type Household = Array<{
  staffInfo: { personNumber: string; preferredName: string };
}>;

const singleStaffMember: Household = [
  { staffInfo: { personNumber: userPersonNumber, preferredName: 'John' } },
];
const marriedCouple: Household = [
  ...singleStaffMember,
  { staffInfo: { personNumber: spousePersonNumber, preferredName: 'Jane' } },
];

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

const TestComponent: React.FC<
  CategoryBreakdownDialogProps & { household?: Household }
> = ({ household = singleStaffMember, ...props }) => {
  return (
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{ Hcm: HcmQuery }> mocks={{ Hcm: { hcm: household } }}>
        <CategoryBreakdownDialog {...props} />
      </GqlMockedProvider>
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

  describe('person column', () => {
    const householdTransactions: Transaction[] = [
      { ...mockTransactions[0], personNumber: userPersonNumber },
      { ...mockTransactions[1], personNumber: spousePersonNumber },
    ];

    it('names the person each transaction belongs to', async () => {
      const { findByRole, getByRole } = render(
        <TestComponent
          {...defaultProps}
          transactions={householdTransactions}
          household={marriedCouple}
        />,
      );

      expect(
        await findByRole('columnheader', { name: 'Person' }),
      ).toBeInTheDocument();
      expect(getByRole('cell', { name: 'John' })).toBeInTheDocument();
      expect(getByRole('cell', { name: 'Jane' })).toBeInTheDocument();
    });

    it('puts the person between Category and Amount', async () => {
      const { findByRole, getAllByRole } = render(
        <TestComponent
          {...defaultProps}
          transactions={householdTransactions}
          household={marriedCouple}
        />,
      );
      await findByRole('columnheader', { name: 'Person' });

      // rows[0] is the header; rows[1] is the first sorted transaction.
      const firstRowCells = within(getAllByRole('row')[1]).getAllByRole('cell');
      // Columns: Date | Description | Category | Person | Amount
      expect(firstRowCells[2]).toHaveTextContent('Salary - Bereavement');
      expect(firstRowCells[3]).toHaveTextContent('John');
      expect(firstRowCells[4]).toHaveTextContent('$500');
    });

    it('is hidden for a single staff member', async () => {
      const { findByRole, queryByRole } = render(
        <TestComponent
          {...defaultProps}
          transactions={householdTransactions}
        />,
      );
      // Wait for the HCM lookup to resolve before asserting on its absence.
      await findByRole('columnheader', { name: 'Category' });

      expect(
        queryByRole('columnheader', { name: 'Person' }),
      ).not.toBeInTheDocument();
      expect(queryByRole('cell', { name: 'John' })).not.toBeInTheDocument();
    });

    it('is hidden when the transactions carry no person number', async () => {
      const { findByRole, queryByRole } = render(
        <TestComponent {...defaultProps} household={marriedCouple} />,
      );
      await findByRole('columnheader', { name: 'Category' });

      expect(
        queryByRole('columnheader', { name: 'Person' }),
      ).not.toBeInTheDocument();
    });

    it('leaves the person blank when a transaction has no person number', async () => {
      const mixedTransactions: Transaction[] = [
        householdTransactions[0],
        { ...mockTransactions[1], personNumber: null },
      ];
      const { findByRole, getAllByRole } = render(
        <TestComponent
          {...defaultProps}
          transactions={mixedTransactions}
          household={marriedCouple}
        />,
      );
      await findByRole('columnheader', { name: 'Person' });

      const secondRowCells = within(getAllByRole('row')[2]).getAllByRole(
        'cell',
      );
      expect(secondRowCells[3]).toHaveTextContent('');
    });
  });
});
