import React from 'react';
import { render } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  NewStaffGoalCalculationFieldsFragment,
  NewStaffGoalCalculationFieldsFragmentDoc,
} from '../GoalSettings/NewStaffGoalCalculation.generated';
import { NsGoalCalculation } from '../Shared/NsGoalCalculatorContext';
import { MonthlyNeedsCard } from './MonthlyNeedsCard';

type Calculations = NsGoalCalculation['calculations'];

/**
 * Builds a calculations worksheet, mocking only the lines a test asserts on
 * and letting gqlMock fill the rest.
 */
const buildCalculations = (
  overrides: DeepPartial<Calculations>,
): Calculations =>
  gqlMock<NewStaffGoalCalculationFieldsFragment>(
    NewStaffGoalCalculationFieldsFragmentDoc,
    {
      mocks: { calculations: overrides },
    },
  ).calculations;

describe('MonthlyNeedsCard', () => {
  it('renders every line of the worksheet in order', () => {
    const calculations = buildCalculations({
      salary: 8774,
      seca: 1492,
      salarySubtotal: 10266,
      totalContributing403bAmount: 990,
      totalSalary: 11256,
      ministryMiles: 100,
      travel: 60,
      conferences: 200,
      meals: 100,
      mpd: 200,
      supplies: 100,
      staffConferenceTransfer: 0,
      benefitsCharge: 1911,
      medicalExpenses: 138,
      accountTransfers: 0,
      advocacyTransfers: 0,
      otherExpenses: 0,
      goalSubtotal: 14203,
      subtotalWithAdminCharge: 17108,
      monthlyGoal: 18134,
      adminRate: 0.12,
    });
    const { getByRole } = render(
      <MonthlyNeedsCard
        calculations={calculations}
        supportRaised={1200}
        columnLabel="John & Jane"
      />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders: ['', 'Category', 'John & Jane'],
      rowHeaders: [
        expect.stringContaining('Salary'),
        expect.stringContaining('SECA, other taxes'),
        expect.stringContaining('Subtotal Salary'),
        expect.stringContaining('403(b) Voluntary Retirement Plan'),
        expect.stringContaining('Total Salary'),
        expect.stringContaining('Ministry Miles'),
        expect.stringContaining('Travel'),
        expect.stringContaining('Meetings, Retreats, Conferences'),
        expect.stringContaining('Meals and Per Diem'),
        expect.stringContaining('MPD'),
        expect.stringContaining('Supplies and Materials'),
        expect.stringContaining('Summer Expenses'),
        expect.stringContaining('Benefits'),
        expect.stringContaining('Reimbursable Medical Expenses'),
        expect.stringContaining('Transfers to other staff, EMAF, etc.'),
        expect.stringContaining('Advocacy (optional)'),
        expect.stringContaining('Other'),
        expect.stringContaining('Subtotal'),
        expect.stringContaining('Subtotal for 12% Admin charge'),
        expect.stringContaining('Total Goal'),
        expect.stringContaining('Solid Monthly Support Developed'),
        expect.stringContaining('Monthly Support to be Developed'),
      ],
      cells: [
        ['1A', '$8,774.00'],
        ['1B', '$1,492.00'],
        ['1C', '$10,266.00'],
        ['1D', '$990.00'],
        ['1', '$11,256.00'],
        ['2', '$100.00'],
        ['3', '$60.00'],
        ['4', '$200.00'],
        ['5', '$100.00'],
        ['6', '$200.00'],
        ['7', '$100.00'],
        ['8', '$0.00'],
        ['9', '$1,911.00'],
        ['10', '$138.00'],
        ['11', '$0.00'],
        ['12', '$0.00'],
        ['13', '$0.00'],
        ['14', '$14,203.00'],
        ['15', '$17,108.00'],
        ['16', '$18,134.00'],
        ['17', '$1,200.00'],
        // Line 18 = line 16 (monthly goal) minus line 17 (support raised).
        ['18', '$16,934.00'],
      ],
    });
  });
});
