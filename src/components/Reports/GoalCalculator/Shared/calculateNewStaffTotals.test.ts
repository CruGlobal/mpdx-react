import { MpdGoalBenefitsConstantSizeEnum } from 'src/graphql/types.generated';
import { formatConstants } from 'src/hooks/useGoalCalculatorConstants';
import {
  constantsMock,
  goalCalculationMock,
} from '../GoalCalculatorTestWrapper';
import { calculateNewStaffGoalTotals } from './calculateNewStaffTotals';

describe('calculateNewStaffTotals', () => {
  const constants = formatConstants(constantsMock);

  it('should calculate goal totals correctly', () => {
    expect(calculateNewStaffGoalTotals(goalCalculationMock, constants)).toEqual(
      {
        monthlyBudget: expect.closeTo(5381, 0),
        netMonthlySalary: expect.closeTo(5381, 0),
        taxesPercentage: 0.22,
        taxes: expect.closeTo(1184, 0),
        salaryPreIra: expect.closeTo(6565, 0),
        rothContributionPercentage: 0.07,
        traditionalContributionPercentage: 0,
        rothContribution: expect.closeTo(494, 0),
        traditionalContribution: 0,
        grossAnnualSalary: expect.closeTo(84707, 0),
        grossMonthlySalary: expect.closeTo(7059, 0),
        ministryExpensesTotal: 822.5,
        benefitsCharge: 1910.54,
        overallSubtotal: expect.closeTo(9792, 0),
        overallSubtotalWithAdmin: expect.closeTo(11127, 0),
        attrition: expect.closeTo(668, 0),
        overallTotal: expect.closeTo(11795, 0),
      },
    );
  });

  it('handles single staff', () => {
    expect(
      calculateNewStaffGoalTotals(
        {
          ...goalCalculationMock,
          familySize: MpdGoalBenefitsConstantSizeEnum.Single,
        },
        constants,
      ),
    ).toEqual({
      monthlyBudget: expect.closeTo(3059, 0),
      netMonthlySalary: expect.closeTo(3059, 0),
      taxesPercentage: 0.22,
      taxes: expect.closeTo(673, 0),
      salaryPreIra: expect.closeTo(3732, 0),
      rothContributionPercentage: 0.07,
      traditionalContributionPercentage: 0,
      rothContribution: expect.closeTo(281, 0),
      traditionalContribution: 0,
      grossAnnualSalary: expect.closeTo(48153, 0),
      grossMonthlySalary: expect.closeTo(4013, 0),
      ministryExpensesTotal: 490,
      benefitsCharge: 1008.6,
      overallSubtotal: expect.closeTo(5511, 0),
      overallSubtotalWithAdmin: expect.closeTo(6263, 0),
      attrition: expect.closeTo(376, 0),
      overallTotal: expect.closeTo(6639, 0),
    });
  });

  it('handles geographic multiplier', () => {
    expect(
      calculateNewStaffGoalTotals(
        {
          ...goalCalculationMock,
          geographicLocation: 'Orlando, FL',
        },
        constants,
      ),
    ).toEqual({
      monthlyBudget: expect.closeTo(5686, 0),
      netMonthlySalary: expect.closeTo(5686, 0),
      taxesPercentage: 0.22,
      taxes: expect.closeTo(1251, 0),
      salaryPreIra: expect.closeTo(6937, 0),
      rothContributionPercentage: 0.07,
      traditionalContributionPercentage: 0,
      rothContribution: expect.closeTo(522, 0),
      traditionalContribution: 0,
      grossAnnualSalary: expect.closeTo(89514, 0),
      grossMonthlySalary: expect.closeTo(7459, 0),
      ministryExpensesTotal: 822.5,
      benefitsCharge: 1910.54,
      overallSubtotal: expect.closeTo(10192, 0),
      overallSubtotalWithAdmin: expect.closeTo(11582, 0),
      attrition: expect.closeTo(695, 0),
      overallTotal: expect.closeTo(12277, 0),
    });
  });
});
