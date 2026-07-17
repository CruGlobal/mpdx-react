import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { TotalsProvider } from '../TotalsContext/TotalsContext';
import { mockBreakdownData } from '../mockData';
import { BreakdownModal, BreakdownModalProps } from './BreakdownModal';

const defaultProps: BreakdownModalProps = {
  open: true,
  onClose: jest.fn(),
  category: StaffExpenseCategoryEnum.Donation,
  breakdownData: mockBreakdownData,
};

const TestComponent: React.FC<BreakdownModalProps> = (props) => (
  <ThemeProvider theme={theme}>
    <TotalsProvider
      data={{ income: [], expenses: [] }}
      startDate={DateTime.local(2019, 2, 1)}
      endDate={DateTime.local(2020, 1, 1)}
    >
      <BreakdownModal {...props} />
    </TotalsProvider>
  </ThemeProvider>
);

describe('BreakdownModal', () => {
  it('renders title and column headers of dialog', () => {
    const { getByText, getByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(getByText('Donation Breakdown')).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'February 2019 - January 2020' }),
    ).toBeInTheDocument();
  });

  it('renders an accordion per subcategory with its own total', () => {
    const { getAllByRole } = render(<TestComponent {...defaultProps} />);

    const summaries = getAllByRole('button').filter((button) =>
      button.hasAttribute('aria-expanded'),
    );

    expect(summaries).toHaveLength(2);
    expect(summaries[0]).toHaveTextContent('Donation');
    expect(summaries[0]).toHaveTextContent('$5,000.00');
    expect(summaries[1]).toHaveTextContent('Donation - Non Cash');
    expect(summaries[1]).toHaveTextContent('$1,770.00');
  });

  it('totals every accordion in the footer', () => {
    const { getByText } = render(<TestComponent {...defaultProps} />);

    expect(getByText('Total Donation Income')).toBeInTheDocument();
    expect(getByText('$6,770.00')).toBeInTheDocument();
  });

  it('renders no accordions for a category without breakdown data', () => {
    const { getByRole, queryByText } = render(
      <TestComponent
        {...defaultProps}
        category={StaffExpenseCategoryEnum.Salary}
      />,
    );

    expect(getByRole('dialog')).toBeInTheDocument();
    expect(queryByText('Donation - Non Cash')).not.toBeInTheDocument();
  });
});
