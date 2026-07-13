import { render } from '@testing-library/react';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { MpdGoalPrintTable } from './MpdGoalPrintTable';

const TestComponent: React.FC = () => (
  <GoalCalculatorTestWrapper>
    <MpdGoalPrintTable supportRaised={1000} />
  </GoalCalculatorTestWrapper>
);

describe('MpdGoalPrintTable', () => {
  it('renders the column headers', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('columnheader', { name: 'Line' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'NS Reference' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
  });

  it('renders a row for each goal line', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('cell', { name: 'Gross Monthly Salary' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'MPD' })).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'Ministry Expenses Subtotal' }),
    ).toBeInTheDocument();
  });

  it('bolds subtotal/total lines and adds top borders to lines 1 and 6', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('cell', { name: 'Gross Annual Salary' }),
    ).toHaveStyle('font-weight: 700');
    expect(getByRole('cell', { name: 'Gross Monthly Salary' })).toHaveStyle(
      'border-top: 3px solid black',
    );
  });

  it('indents category cells for sub-lines but not whole lines', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('cell', { name: 'Net Monthly Combined Salary' }),
    ).toHaveStyle('padding-left: 32px');
    expect(getByRole('cell', { name: 'Gross Monthly Salary' })).not.toHaveStyle(
      'padding-left: 32px',
    );
  });
});
