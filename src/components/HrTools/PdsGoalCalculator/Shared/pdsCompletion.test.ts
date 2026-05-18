import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculationFieldsFragment } from '../GoalsList/PdsGoalCalculations.generated';
import { PdsSummaryData } from '../calculations/usePdsSummaryData';
import {
  isAnnualReimbursableComplete,
  isMonthlyReimbursableComplete,
  isMpdGoalComplete,
  isSetupComplete,
} from './pdsCompletion';

const baseCalculation: PdsGoalCalculationFieldsFragment = {
  id: 'goal-1',
  name: 'Test Goal',
  status: DesignationSupportStatus.FullTime,
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 50000,
  hoursWorkedPerWeek: null,
  benefits: 1500,
  formType: null,
  updatedAt: '2026-01-01T00:00:00Z',
  averageHoursPerWeek: null,
  geographicLocation: null,
  ministryCellPhone: null,
  ministryInternet: null,
  mpdNewsletter: null,
  mpdMiscellaneous: null,
  accountTransfers: null,
  otherMonthlyReimbursements: null,
  conferenceRetreatCosts: null,
  ministryTravelMeals: null,
  otherAnnualReimbursements: null,
  designationSupportHoursItems: [],
};

describe('isSetupComplete', () => {
  it('returns false when calculation is undefined', () => {
    expect(isSetupComplete(undefined)).toBe(false);
  });

  it('returns true when all required fields are set for a salaried full-time goal', () => {
    expect(isSetupComplete(baseCalculation)).toBe(true);
  });

  it('returns false when name is empty', () => {
    expect(isSetupComplete({ ...baseCalculation, name: '' })).toBe(false);
  });

  it('returns false when payRate is missing or zero', () => {
    expect(isSetupComplete({ ...baseCalculation, payRate: null })).toBe(false);
    expect(isSetupComplete({ ...baseCalculation, payRate: 0 })).toBe(false);
  });

  it('requires hoursWorkedPerWeek when pay type is Hourly', () => {
    const hourly: PdsGoalCalculationFieldsFragment = {
      ...baseCalculation,
      salaryOrHourly: DesignationSupportSalaryType.Hourly,
      hoursWorkedPerWeek: null,
    };
    expect(isSetupComplete(hourly)).toBe(false);
    expect(isSetupComplete({ ...hourly, hoursWorkedPerWeek: 30 })).toBe(true);
  });

  it('does not require benefits when status is Part-time', () => {
    const partTime: PdsGoalCalculationFieldsFragment = {
      ...baseCalculation,
      status: DesignationSupportStatus.PartTime,
      benefits: null,
    };
    expect(isSetupComplete(partTime)).toBe(true);
  });

  it('does not require benefits when status is Full-time', () => {
    expect(isSetupComplete({ ...baseCalculation, benefits: null })).toBe(true);
  });
});

describe('isMonthlyReimbursableComplete', () => {
  it('returns false when no monthly fields have been touched', () => {
    expect(isMonthlyReimbursableComplete(baseCalculation)).toBe(false);
  });

  it('returns true when any monthly field has a value, including zero', () => {
    expect(
      isMonthlyReimbursableComplete({
        ...baseCalculation,
        ministryCellPhone: 0,
      }),
    ).toBe(true);
    expect(
      isMonthlyReimbursableComplete({
        ...baseCalculation,
        otherMonthlyReimbursements: 25,
      }),
    ).toBe(true);
  });
});

describe('isAnnualReimbursableComplete', () => {
  it('returns false when no annual fields have been touched', () => {
    expect(isAnnualReimbursableComplete(baseCalculation)).toBe(false);
  });

  it('returns true when any annual field has a value', () => {
    expect(
      isAnnualReimbursableComplete({
        ...baseCalculation,
        conferenceRetreatCosts: 0,
      }),
    ).toBe(true);
  });
});

describe('isMpdGoalComplete', () => {
  it('returns false when summaryData is null', () => {
    expect(isMpdGoalComplete(null)).toBe(false);
  });

  it('returns false when overallTotal is zero', () => {
    expect(isMpdGoalComplete({ overallTotal: 0 } as PdsSummaryData)).toBe(
      false,
    );
  });

  it('returns true when overallTotal is positive', () => {
    expect(isMpdGoalComplete({ overallTotal: 1234 } as PdsSummaryData)).toBe(
      true,
    );
  });
});
