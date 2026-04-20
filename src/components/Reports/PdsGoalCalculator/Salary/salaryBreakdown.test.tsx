import { DataGrid } from '@mui/x-data-grid';
import { render } from '@testing-library/react';
import { t } from 'i18next';
import { DesignationSupportSalaryType } from 'src/graphql/types.generated';
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
        columns={buildSalaryBreakdownColumns('en-US', t)}
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
      t,
    );
    expect(rows.map((row) => row.id)).toEqual([
      'pay-rate',
      'monthly-base',
      'geographic-multiplier',
      'gross-monthly-pay',
      'employer-fica',
      'total',
    ]);
  });

  it('inserts hours-per-week and monthly-base rows for hourly', () => {
    const rows = buildSalaryBreakdownRows(
      hourlyCalculation,
      constants,
      'en-US',
      t,
    );
    expect(rows.map((row) => row.id)).toEqual([
      'pay-rate',
      'hours-per-week',
      'monthly-base',
      'geographic-multiplier',
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
