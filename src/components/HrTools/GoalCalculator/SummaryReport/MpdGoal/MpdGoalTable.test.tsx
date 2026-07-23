import { render } from '@testing-library/react';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from '../../GoalCalculatorTestWrapper';
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

  it('adds classes to certain columns and rows', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

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
    expect(
      await findByRole('gridcell', { name: '$5,211' }, { timeout: 10000 }),
    ).toHaveClass('reference');
  }, 30000);

  it('sources reference rates from the backend calculation', async () => {
    // The backend rates deliberately differ from the client constants (0.22 SECA / 0.07 403(b)) so
    // this test fails if the reference column ever falls back to the constants.
    const goalCalculationWithDistinctRates = {
      ...goalCalculationMock,
      newStaffCalculations: {
        ...goalCalculationMock.newStaffCalculations,
        secaRate: 0.25,
        contribution403bPercentage: 0.09,
      },
    };

    const { getByRole, findByRole } = render(
      <GoalCalculatorTestWrapper
        goalCalculation={goalCalculationWithDistinctRates}
      >
        <MpdGoalTable supportRaised={1000} />
      </GoalCalculatorTestWrapper>,
    );

    // Wait for the calculation-backed reference column to render
    await findByRole('gridcell', { name: '$5,211' }, { timeout: 10000 });

    const referenceCell = (category: string) =>
      getByRole('gridcell', { name: category }).parentElement?.querySelector(
        '.MuiDataGrid-cell.reference',
      );

    // Line 1B % ← secaRate (0.25), Line 1E % ← contribution403bPercentage (0.09).
    // Both differ from the client constants, so the reference column can only match if it reads
    // the server calculation.
    expect(referenceCell('Taxes, SECA, VTL, etc. %')).toHaveTextContent(
      '25.00%',
    );
    expect(referenceCell('Roth 403(b) Contribution %')).toHaveTextContent(
      '9.00%',
    );

    // The line 5/6 *labels* are formatted from the client constants (12% admin / 6% attrition),
    // not the server rates — the reference column's grossed-up values use the server rates, but the
    // label text does not.
    expect(
      getByRole('gridcell', { name: /Subtotal with 12% admin charge/ }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', {
        name: /Total Goal \(line 5 with 6% attrition\)/,
      }),
    ).toBeInTheDocument();
  }, 30000);
});
