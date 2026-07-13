import { DataGrid } from '@mui/x-data-grid';
import { render } from '@testing-library/react';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { OtherExpensesConstants } from '../calculations/OtherExpenses';
import { SalaryConstants } from '../calculations/salaryCalculation';
import {
  SupportItemBreakdownRow,
  SupportItemCalculationFields,
  buildSupportItemBreakdownColumns,
  buildSupportItemBreakdownRows,
} from './supportItemBreakdown';

const salaryConstants: SalaryConstants = {
  geographicMultiplier: 0,
  employerFicaRate: 0.08,
};

const otherConstants: OtherExpensesConstants = {
  reimbursableTotal: 300,
  salarySubtotal: 5400,
  fourOThreeBPercentage: 0.08,
  grossMonthlyPay: 5000,
  workCompAmount: 100,
  attritionRate: 0.05,
  creditCardFeeRate: 0.03,
  adminRate: 0.1,
};

const fullTimeCalculation: SupportItemCalculationFields = {
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  // Yearly salary — divided by 12 for monthly base
  payRate: 60000,
  hoursWorkedPerWeek: null,
  geographicLocation: null,
  status: DesignationSupportStatus.FullTime,
  benefits: 1500,
};

const partTimeCalculation: SupportItemCalculationFields = {
  ...fullTimeCalculation,
  status: DesignationSupportStatus.PartTime,
  benefits: 0,
};

const hourlyCalculation: SupportItemCalculationFields = {
  ...fullTimeCalculation,
  salaryOrHourly: DesignationSupportSalaryType.Hourly,
  payRate: 25,
  hoursWorkedPerWeek: 40,
};

const buildRows = (calculation: SupportItemCalculationFields) =>
  buildSupportItemBreakdownRows(
    calculation,
    salaryConstants,
    otherConstants,
    i18n.t,
  );

const renderBreakdown = (rows: SupportItemBreakdownRow[]) =>
  render(
    <div style={{ height: 500 }}>
      <DataGrid
        rows={rows}
        columns={buildSupportItemBreakdownColumns('en-US', i18n.t)}
        hideFooter
        disableVirtualization
      />
    </div>,
  );

describe('buildSupportItemBreakdownRows', () => {
  it('returns the combined salaried full-time row sequence', () => {
    const rows = buildRows(fullTimeCalculation);
    expect(rows.map((row) => row.id)).toEqual([
      'pay-rate',
      'monthly-base',
      'gross-monthly-pay',
      'employer-fica',
      'reimbursable-expenses',
      '403b-contributions',
      'benefits',
      'subtotal',
      'attrition',
      'credit-card-fees',
      'assessment',
    ]);
  });

  it('inserts the hours-per-week row for hourly employees', () => {
    const rows = buildRows(hourlyCalculation);
    expect(rows.map((row) => row.id)).toEqual([
      'pay-rate',
      'hours-per-week',
      'monthly-base',
      'gross-monthly-pay',
      'employer-fica',
      'reimbursable-expenses',
      '403b-contributions',
      'benefits',
      'subtotal',
      'attrition',
      'credit-card-fees',
      'assessment',
    ]);
  });

  it('shows work comp instead of benefits for part-time employees', () => {
    const rows = buildRows(partTimeCalculation);
    const ids = rows.map((row) => row.id);
    expect(ids).toContain('work-comp');
    expect(ids).not.toContain('benefits');
  });

  it('omits both benefits and work comp when status is null', () => {
    const rows = buildRows({ ...fullTimeCalculation, status: null });
    const ids = rows.map((row) => row.id);
    expect(ids).not.toContain('work-comp');
    expect(ids).not.toContain('benefits');
  });

  it('omits reimbursable expenses and 403b contributions when formType is Simple', () => {
    const rows = buildRows({
      ...fullTimeCalculation,
      formType: DesignationSupportFormType.Simple,
    });
    const ids = rows.map((row) => row.id);
    expect(ids).not.toContain('reimbursable-expenses');
    expect(ids).not.toContain('403b-contributions');
  });

  it('computes correct amounts for a salaried employee', () => {
    const rows = buildRows(fullTimeCalculation);
    const byId = Object.fromEntries(rows.map((row) => [row.id, row.amount]));

    // payRate = 60000
    expect(byId['pay-rate']).toBe(60000);
    // monthlyBase = 60000 / 12 = 5000
    expect(byId['monthly-base']).toBe(5000);
    // grossMonthlyPay = 5000 * (1 + 0) = 5000
    expect(byId['gross-monthly-pay']).toBe(5000);
    // employerFica = 5000 * 0.08 = 400
    expect(byId['employer-fica']).toBe(400);
    // reimbursable floor
    expect(byId['reimbursable-expenses']).toBe(300);
    // 403b = 5000 * 0.08 = 400
    expect(byId['403b-contributions']).toBe(400);
    expect(byId['benefits']).toBe(1500);
    // subtotal = 5400 + 300 + 400 + 1500 = 7600
    expect(byId['subtotal']).toBe(7600);
  });

  it('computes correct amounts for an hourly employee', () => {
    const rows = buildRows(hourlyCalculation);
    const byId = Object.fromEntries(rows.map((row) => [row.id, row.amount]));

    // payRate = 25
    expect(byId['pay-rate']).toBe(25);
    // hoursPerWeek = 40
    expect(byId['hours-per-week']).toBe(40);
    // monthlyBase = (25 * 40 * 52) / 12 ≈ 4333.33
    expect(byId['monthly-base']).toBeCloseTo(4333.33, 2);
    // employerFica = 4333.33 * 0.08 ≈ 346.67
    expect(byId['employer-fica']).toBeCloseTo(346.67, 2);
  });

  it('marks subtotal, attrition, credit-card-fees, and assessment as bold', () => {
    const rows = buildRows(fullTimeCalculation);
    const boldIds = rows.filter((row) => row.bold).map((row) => row.id);
    expect(boldIds).toEqual([
      'subtotal',
      'attrition',
      'credit-card-fees',
      'assessment',
    ]);
  });

  it('does not include formula math detail on any row', () => {
    const rows = buildRows(fullTimeCalculation);
    rows.forEach((row) => {
      expect(row).not.toHaveProperty('formula');
    });
  });
});

describe('buildSupportItemBreakdownColumns', () => {
  it('renders category and formatted currency amount', () => {
    const { getByRole, getByTestId } = renderBreakdown([
      {
        id: 'gross-monthly-pay',
        category: 'Gross Monthly Pay',
        amount: 5000,
        format: 'currency',
      },
    ]);

    expect(
      getByRole('gridcell', { name: 'Gross Monthly Pay' }),
    ).toBeInTheDocument();
    expect(getByTestId('gross-monthly-pay')).toHaveTextContent('$5,000');
  });

  it('formats number rows without a currency symbol', () => {
    const { getByTestId } = renderBreakdown([
      {
        id: 'hours-per-week',
        category: 'Hours per Week',
        amount: 40,
        format: 'number',
      },
    ]);

    expect(getByTestId('hours-per-week')).toHaveTextContent(/^40$/);
  });

  it('renders a tooltip icon when tooltip is provided', () => {
    const { getByLabelText } = renderBreakdown([
      {
        id: 'reimbursable-expenses',
        category: 'Reimbursable Expenses',
        amount: 300,
        format: 'currency',
        tooltip: 'To change this amount, update the Reimbursable Expenses step',
      },
    ]);

    expect(
      getByLabelText(
        'To change this amount, update the Reimbursable Expenses step',
      ),
    ).toBeInTheDocument();
  });
});
