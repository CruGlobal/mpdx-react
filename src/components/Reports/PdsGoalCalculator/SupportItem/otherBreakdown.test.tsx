import { DataGrid } from '@mui/x-data-grid';
import { render } from '@testing-library/react';
import { t } from 'i18next';
import { DesignationSupportStatus } from 'src/graphql/types.generated';
import { OtherExpensesConstants, OtherExpensesFields } from '../calculations/OtherExpenses';
import {
  OtherBreakdownRow,
  buildOtherBreakdownColumns,
  buildOtherBreakdownRows,
} from './otherBreakdown';

const constants: OtherExpensesConstants = {
  reimbursableTotal: 300,
  salarySubtotal: 5000,
  fourOThreeBPercentage: 0.08,
  grossMonthlyPay: 5000,
  workCompPercentage: 0.02,
  attritionRate: 0.05,
  creditCardFeeRate: 0.03,
  adminRate: 0.1,
};

const fullTimeCalculation: OtherExpensesFields = {
  status: DesignationSupportStatus.FullTime,
  benefits: 1500,
};

const partTimeCalculation: OtherExpensesFields = {
  status: DesignationSupportStatus.PartTime,
  benefits: 0,
};

const nullStatusCalculation: OtherExpensesFields = {
  status: null,
  benefits: 0,
};

const renderBreakdown = (rows: OtherBreakdownRow[]) =>
  render(
    <div style={{ height: 500 }}>
      <DataGrid
        rows={rows}
        columns={buildOtherBreakdownColumns('en-US', t)}
        hideFooter
        disableVirtualization
      />
    </div>,
  );

describe('buildOtherBreakdownRows', () => {
  it('returns the full-time row sequence with benefits', () => {
    const rows = buildOtherBreakdownRows(
      fullTimeCalculation,
      constants,
      'en-US',
      t,
    );
    expect(rows.map((row) => row.id)).toEqual([
      'reimbursable-expenses',
      '403b-contributions',
      'benefits',
      'subtotal',
      'attrition',
      'credit-card-fees',
      'assessment',
    ]);
  });

  it('returns the part-time row sequence with work comp', () => {
    const rows = buildOtherBreakdownRows(
      partTimeCalculation,
      constants,
      'en-US',
      t,
    );
    expect(rows.map((row) => row.id)).toEqual([
      'reimbursable-expenses',
      '403b-contributions',
      'work-comp',
      'subtotal',
      'attrition',
      'credit-card-fees',
      'assessment',
    ]);
  });

  it('omits both benefits and work comp when status is null', () => {
    const rows = buildOtherBreakdownRows(
      nullStatusCalculation,
      constants,
      'en-US',
      t,
    );
    expect(rows.map((row) => row.id)).toEqual([
      'reimbursable-expenses',
      '403b-contributions',
      'subtotal',
      'attrition',
      'credit-card-fees',
      'assessment',
    ]);
  });

  it('marks subtotal, attrition, credit-card-fees, and assessment as bold', () => {
    const rows = buildOtherBreakdownRows(
      fullTimeCalculation,
      constants,
      'en-US',
      t,
    );
    const boldIds = rows.filter((row) => row.bold).map((row) => row.id);
    expect(boldIds).toEqual([
      'subtotal',
      'attrition',
      'credit-card-fees',
      'assessment',
    ]);
  });

  it('sets testId on every row', () => {
    const rows = buildOtherBreakdownRows(
      fullTimeCalculation,
      constants,
      'en-US',
      t,
    );
    rows.forEach((row) => {
      expect(row.testId).toBeDefined();
    });
  });
});

describe('buildOtherBreakdownColumns', () => {
  it('renders a category without formula subtext', () => {
    const { getByRole, queryByRole } = renderBreakdown([
      {
        id: 'benefits',
        category: 'Benefits for Full-time',
        amount: 1500,
      },
    ]);

    expect(
      getByRole('gridcell', { name: 'Benefits for Full-time' }),
    ).toBeInTheDocument();
    expect(queryByRole('gridcell', { name: /×/ })).not.toBeInTheDocument();
  });

  it('renders a category with formula subtext', () => {
    const { getByRole } = renderBreakdown([
      {
        id: 'attrition',
        category: 'Attrition',
        formula: 'Subtotal × 5%',
        amount: 340,
      },
    ]);
    expect(
      getByRole('gridcell', { name: 'Attrition Subtotal × 5%' }),
    ).toBeInTheDocument();
  });

  it('renders a tooltip icon when tooltip is provided', () => {
    const { getByLabelText } = renderBreakdown([
      {
        id: 'reimbursable-expenses',
        category: 'Reimbursable Expenses',
        amount: 300,
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
