import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import {
  PdsGoalTotalConstants,
  PdsGoalTotalFields,
  calculatePdsGoalTotal,
} from './calculatePdsGoalTotal';

const defaultConstants: PdsGoalTotalConstants = {
  employerFicaRate: 0.08,
  workCompPercentage: 0.17,
  attritionRate: 0.06,
  creditCardFeeRate: 0.06,
  adminRate: 0.12,
  fourOThreeBPercentage: 0.1,
  geographicMultiplier: 0,
};

const makeGoal = (
  overrides: Partial<PdsGoalTotalFields> = {},
): PdsGoalTotalFields => ({
  hoursWorkedPerWeek: null,
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  status: DesignationSupportStatus.FullTime,
  payRate: 60000,
  benefits: 1500,
  geographicLocation: null,
  ministryCellPhone: 50,
  ministryInternet: 50,
  mpdNewsletter: 50,
  mpdMiscellaneous: 50,
  accountTransfers: 50,
  otherMonthlyReimbursements: 50,
  conferenceRetreatCosts: 0,
  ministryTravelMeals: 0,
  otherAnnualReimbursements: 0,
  ...overrides,
});

describe('calculatePdsGoalTotal', () => {
  it('computes the final assessment for a full-time salaried employee', () => {
    const goal = makeGoal();
    const result = calculatePdsGoalTotal(goal, defaultConstants);
    // assessment ≈ 1038.21
    expect(result).toBeCloseTo(1038.21, 1);
  });

  it('computes the final assessment for a part-time hourly employee', () => {
    const goal = makeGoal({
      status: DesignationSupportStatus.PartTime,
      salaryOrHourly: DesignationSupportSalaryType.Hourly,
      payRate: 25,
      hoursWorkedPerWeek: 20,
      benefits: null,
    });
    const result = calculatePdsGoalTotal(goal, defaultConstants);
    expect(result).toBeCloseTo(434.83, 0);
  });

  it('returns a positive value when payRate is null', () => {
    const goal = makeGoal({ payRate: null });
    const result = calculatePdsGoalTotal(goal, defaultConstants);
    expect(result).toBeGreaterThan(0);
  });

  it('applies geographic multiplier', () => {
    const goal = makeGoal();
    const withGeo = calculatePdsGoalTotal(goal, {
      ...defaultConstants,
      geographicMultiplier: 0.06,
    });
    const withoutGeo = calculatePdsGoalTotal(goal, defaultConstants);
    expect(withGeo).toBeGreaterThan(withoutGeo);
  });

  it('excludes reimbursable expenses and 403b when formType is Simple', () => {
    const simple = makeGoal({ formType: DesignationSupportFormType.Simple });
    const result = calculatePdsGoalTotal(simple, defaultConstants);
    // With reimbursableTotal=0 and fourOThreeBPercentage=0:
    //   subtotal = 5400 (salary) + 0 + 0 + 0 + 1500 (benefits) = 6900
    //   attrition = 6900 * 0.06 = 414
    //   creditCardFees = (6900 + 414) * 0.06 = 438.84
    //   assessment = (6900 + 438.84 + 414) * 0.12 ≈ 930.34
    expect(result).toBeCloseTo(930.34, 1);
  });

  it('treats null formType the same as Detailed (legacy goals)', () => {
    const legacy = makeGoal({ formType: null });
    const detailed = makeGoal({
      formType: DesignationSupportFormType.Detailed,
    });
    expect(calculatePdsGoalTotal(legacy, defaultConstants)).toBeCloseTo(
      calculatePdsGoalTotal(detailed, defaultConstants),
    );
  });
});
