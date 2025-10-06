import { render } from '@testing-library/react';
import { GoalCalculatorTestWrapper } from '../../GoalCalculatorTestWrapper';
import { MpdGoalTable } from './MpdGoalTable';

const TestComponent: React.FC = () => (
  <GoalCalculatorTestWrapper>
    <MpdGoalTable supportRaised={1000} />
  </GoalCalculatorTestWrapper>
);

describe('MpdGoalTable', () => {
  it('renders the table', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('grid', { name: 'MPD Goal' })).toBeInTheDocument();
  });

  it('adds classes to certain columns and rows', () => {
    const { getByRole } = render(<TestComponent />);

    const grossAnnualRow = getByRole('gridcell', {
      name: 'Gross Annual Salary',
    }).parentElement;
    expect(grossAnnualRow).toHaveClass('bold');

    const grossMonthlyRow = getByRole('gridcell', {
      name: 'Gross Monthly Salary',
    }).parentElement;
    expect(grossMonthlyRow).toHaveClass('top-border');

    const totalGoalRow = getByRole('gridcell', {
      name: /Total Goal/,
    }).parentElement;
    expect(totalGoalRow).toHaveClass('bold', 'top-border');

    const monthlySupportRow = getByRole('gridcell', {
      name: 'Monthly Support to be Developed',
    }).parentElement;
    expect(monthlySupportRow).toHaveClass('bold');

    expect(
      getByRole('gridcell', { name: 'Net Monthly Combined Salary' }),
    ).toHaveClass('indent');
    expect(
      getByRole('gridcell', { name: 'Gross Monthly Salary' }),
    ).not.toHaveClass('indent');

    expect(getByRole('columnheader', { name: 'NS Reference' })).toHaveClass(
      'reference',
    );
    expect(getByRole('gridcell', { name: '$5,511.31' })).toHaveClass(
      'reference',
    );
  });
});
