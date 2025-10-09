import { formatConstants } from 'src/hooks/useGoalCalculatorConstants';
import {
  constantsMock,
  goalCalculationMock,
} from '../GoalCalculatorTestWrapper';
import { calculateNewStaffGoalTotals } from './calculateNewStaffTotals';

describe('calculateNewStaffTotals', () => {
  const constants = formatConstants(constantsMock);
  const benefitsPlans = constantsMock.mpdGoalBenefitsConstants;
  const miscConstants = constants.goalMiscConstants;
  const geographicConstants = constants.goalGeographicConstantMap;

  it('should calculate goal totals correctly', () => {
    expect(
      calculateNewStaffGoalTotals(
        goalCalculationMock,
        benefitsPlans,
        miscConstants,
        geographicConstants,
      ),
    ).toEqual({
      monthlyBudget: expect.closeTo(5042, 0),
      netMonthlySalary: expect.closeTo(5042, 0),
      taxesPercentage: 0.22,
      taxes: expect.closeTo(1109, 0),
      salaryPreIra: expect.closeTo(6151, 0),
      rothContributionPercentage: 0.07,
      traditionalContributionPercentage: 0,
      rothContribution: expect.closeTo(463, 0),
      traditionalContribution: 0,
      grossAnnualSalary: expect.closeTo(79366, 0),
      grossMonthlySalary: expect.closeTo(6614, 0),
      ministryExpensesTotal: 822.5,
      benefitsCharge: 1910.54,
      overallSubtotal: expect.closeTo(9347, 0),
      overallSubtotalWithAdmin: expect.closeTo(10621, 0),
      attrition: expect.closeTo(637, 0),
      overallTotal: expect.closeTo(11259, 0),
    });
  });
});
