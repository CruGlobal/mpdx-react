import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { mockTransactions } from '../mockData';
import {
  BreakdownAccordion,
  BreakdownAccordionProps,
} from './BreakdownAccordion';

const defaultProps: BreakdownAccordionProps = {
  category: StaffExpenseCategoryEnum.Donation,
  subCategory: StaffExpensesSubCategoryEnum.NonCash,
  transactions: mockTransactions,
  total: 6770,
};

const TestComponent: React.FC<BreakdownAccordionProps> = (props) => (
  <ThemeProvider theme={theme}>
    <BreakdownAccordion {...props} />
  </ThemeProvider>
);

describe('BreakdownAccordion', () => {
  it('titles the summary with the category and subcategory', () => {
    const { getByText } = render(<TestComponent {...defaultProps} />);

    expect(getByText('Donation - Non Cash')).toBeInTheDocument();
    expect(getByText('$6,770.00')).toBeInTheDocument();
  });

  it('shows only the category when the subcategory matches it', () => {
    const { getByText, queryByText } = render(
      <TestComponent
        {...defaultProps}
        subCategory={StaffExpensesSubCategoryEnum.Donation}
      />,
    );

    expect(getByText('Donation')).toBeInTheDocument();
    expect(queryByText('Donation - Donation')).not.toBeInTheDocument();
  });

  it('colors an expense total red', () => {
    const { getByText } = render(
      <TestComponent {...defaultProps} total={-6770} />,
    );

    expect(getByText('$6,770.00')).toHaveStyle({
      color: theme.palette.chipRedDark.main,
    });
  });

  describe('Expanded', () => {
    it('renders the transaction column headers', async () => {
      const { getByRole, findAllByRole } = render(
        <TestComponent {...defaultProps} />,
      );

      userEvent.click(getByRole('button'));

      const headers = await findAllByRole('columnheader');
      expect(headers.map((header) => header.textContent)).toEqual([
        'Date',
        'Description',
        'Amount',
      ]);
    });

    it('renders a row per transaction', async () => {
      const { getByRole, findByRole } = render(
        <TestComponent {...defaultProps} />,
      );

      userEvent.click(getByRole('button'));

      expect(
        await findByRole('cell', {
          name: 'Monthly gift from the Smith family',
        }),
      ).toBeInTheDocument();
      expect(getByRole('cell', { name: '$5,000.00' })).toBeInTheDocument();
      expect(getByRole('cell', { name: 'One-time gift' })).toBeInTheDocument();
      expect(getByRole('cell', { name: '$1,770.00' })).toBeInTheDocument();
    });

    it('falls back to N/A when a transaction has no description', async () => {
      const { getByRole, findByRole } = render(
        <TestComponent
          {...defaultProps}
          transactions={[{ ...mockTransactions[0], description: '' }]}
        />,
      );

      userEvent.click(getByRole('button'));

      expect(await findByRole('cell', { name: 'N/A' })).toBeInTheDocument();
    });

    it('marks a negative transaction inside an income accordion', async () => {
      const { getByRole, findByRole } = render(
        <TestComponent
          {...defaultProps}
          total={50}
          transactions={[
            { ...mockTransactions[0], description: 'Payroll', amount: 100 },
            { ...mockTransactions[0], description: 'Refund', amount: -50 },
          ]}
        />,
      );

      userEvent.click(getByRole('button'));

      const amount = await findByRole('cell', { name: '($50.00)' });
      expect(amount).toHaveStyle({ color: theme.palette.chipRedDark.main });
    });

    it('marks a positive transaction inside an expense accordion', async () => {
      const { getByRole, findByRole } = render(
        <TestComponent
          {...defaultProps}
          total={-50}
          transactions={[
            { ...mockTransactions[0], description: 'Assessment', amount: -100 },
            {
              ...mockTransactions[0],
              description: 'Reimbursement',
              amount: 50,
            },
          ]}
        />,
      );

      userEvent.click(getByRole('button'));

      const amount = await findByRole('cell', { name: '($50.00)' });
      expect(amount).toHaveStyle({ color: theme.palette.statusSuccess.main });
    });
  });
});
