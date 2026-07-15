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
      await findByRole('gridcell', { name: '$5,211' }, { timeout: 5000 }),
    ).toHaveClass('reference');
  }, 30000);

  it('sources reference rates from the backend calculation', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    // Wait for the calculation-backed reference column to render
    await findByRole('gridcell', { name: '$5,211' }, { timeout: 5000 });

    const referenceCell = (category: string) =>
      getByRole('gridcell', { name: category }).parentElement?.querySelector(
        '.MuiDataGrid-cell.reference',
      );

    // Line 1B % ← secaRate (0.22), Line 1E % ← contribution403bPercentage (0.07)
    expect(referenceCell('Taxes, SECA, VTL, etc. %')).toHaveTextContent(
      '22.00%',
    );
    expect(referenceCell('Roth 403(b) Contribution %')).toHaveTextContent(
      '7.00%',
    );

    // Line 5/6 labels ← adminRate (0.12) / attritionRate (0.06)
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
