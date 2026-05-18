import { DataGrid } from '@mui/x-data-grid';
import { render } from '@testing-library/react';
import { DesignationSupportSalaryType } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { SalaryCalculationFields } from '../calculations/salaryCalculation';
import {
  SalaryBreakdownRow,
  buildSalaryBreakdownColumns,
  buildSalaryBreakdownRows,
} from './salaryBreakdown';

const constants = { geographicMultiplier: 0, employerFicaRate: 0.08 };

const salariedCalculation: SalaryCalculationFields = {
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  // Yearly salary — divided by 12 for monthly base
  payRate: 60000,
  hoursWorkedPerWeek: null,
  geographicLocation: null,
};

const hourlyCalculation: SalaryCalculationFields = {
  salaryOrHourly: DesignationSupportSalaryType.Hourly,
  payRate: 25,
  hoursWorkedPerWeek: 40,
  geographicLocation: null,
};

const renderBreakdown = (rows: SalaryBreakdownRow[]) =>
  render(
    <div style={{ height: 500 }}>
      <DataGrid
        rows={rows}
        columns={buildSalaryBreakdownColumns('en-US', i18n.t)}
        hideFooter
        disableVirtualization
      />
    </div>,
  );

describe('buildSalaryBreakdownRows', () => {
  it('returns the salaried row sequence', () => {
    const rows = buildSalaryBreakdownRows(
      salariedCalculation,
      constants,
      'en-US',
      i18n.t,
    );
    expect(rows.map((row) => row.id)).toEqual([
      'pay-rate',
      'monthly-base',
      'gross-monthly-pay',
      'employer-fica',
      'total',
    ]);
  });

  it('computes correct amounts for salaried employee', () => {
    const rows = buildSalaryBreakdownRows(
      salariedCalculation,
      constants,
      'en-US',
      i18n.t,
    );
    const byId = Object.fromEntries(rows.map((r) => [r.id, r.amount]));

    // payRate = 60000
    expect(byId['pay-rate']).toBe(60000);
    // monthlyBase = 60000 / 12 = 5000
    expect(byId['monthly-base']).toBe(5000);
    // grossMonthlyPay = 5000 * (1 + 0) = 5000
    expect(byId['gross-monthly-pay']).toBe(5000);
    // employerFica = 5000 * 0.08 = 400
    expect(byId['employer-fica']).toBe(400);
    // subtotal = 5000 + 400 = 5400
    expect(byId['total']).toBe(5400);
  });

  it('computes correct amounts for hourly employee', () => {
    const rows = buildSalaryBreakdownRows(
      hourlyCalculation,
      constants,
      'en-US',
      i18n.t,
    );
    const byId = Object.fromEntries(rows.map((r) => [r.id, r.amount]));

    // payRate = 25
    expect(byId['pay-rate']).toBe(25);
    // hoursPerWeek = 40
    expect(byId['hours-per-week']).toBe(40);
    // monthlyBase = (25 * 40 * 52) / 12 ≈ 4333.33
    expect(byId['monthly-base']).toBeCloseTo(4333.33, 2);
    // grossMonthlyPay = 4333.33 * (1 + 0) ≈ 4333.33
    expect(byId['gross-monthly-pay']).toBeCloseTo(4333.33, 2);
    // employerFica = 4333.33 * 0.08 ≈ 346.67
    expect(byId['employer-fica']).toBeCloseTo(346.67, 2);
    // subtotal = 4333.33 + 346.67 ≈ 4680.00
    expect(byId['total']).toBeCloseTo(4680.0, 2);
  });

  it('inserts hours-per-week and monthly-base rows for hourly', () => {
    const rows = buildSalaryBreakdownRows(
      hourlyCalculation,
      constants,
      'en-US',
      i18n.t,
    );
    expect(rows.map((row) => row.id)).toEqual([
      'pay-rate',
      'hours-per-week',
      'monthly-base',
      'gross-monthly-pay',
      'employer-fica',
      'total',
    ]);
  });
});

describe('buildSalaryBreakdownColumns', () => {
  it('renders a category without its formula subtext', () => {
    const { getByRole, queryByRole } = renderBreakdown([
      {
        id: 'pay-rate',
        category: 'Pay Rate',
        amount: 5000,
        format: 'currency',
      },
    ]);

    expect(getByRole('gridcell', { name: 'Pay Rate' })).toBeInTheDocument();
    expect(queryByRole('gridcell', { name: /×/ })).not.toBeInTheDocument();
  });

  it('renders a category with its formula subtext', () => {
    const { getByRole } = renderBreakdown([
      {
        id: 'gross-monthly-pay',
        category: 'Gross Monthly Pay',
        formula: 'Pay Rate × (1 + Geographic Multiplier)',
        amount: 5000,
        format: 'currency',
      },
    ]);
    expect(
      getByRole('gridcell', {
        name: 'Gross Monthly Pay Pay Rate × (1 + Geographic Multiplier)',
      }),
    ).toBeInTheDocument();
  });
});
