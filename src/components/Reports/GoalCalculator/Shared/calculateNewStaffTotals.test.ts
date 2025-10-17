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
        monthlyBudget: expect.closeTo(5211, 0),
        netMonthlySalary: expect.closeTo(5211, 0),
        taxesPercentage: 0.22,
        taxes: expect.closeTo(1146, 0),
        salaryPreIra: expect.closeTo(6358, 0),
        rothContributionPercentage: 0.07,
        traditionalContributionPercentage: 0,
        rothContribution: expect.closeTo(479, 0),
        traditionalContribution: 0,
        grossAnnualSalary: expect.closeTo(82036, 0),
        grossMonthlySalary: expect.closeTo(6836, 0),
        ministryExpensesTotal: 822.5,
        benefitsCharge: 1910.54,
        overallSubtotal: expect.closeTo(9569, 0),
        overallSubtotalWithAdmin: expect.closeTo(10874, 0),
        attrition: expect.closeTo(652, 0),
        overallTotal: expect.closeTo(11527, 0),
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

  it('handles multiple children', () => {
    expect(
      calculateNewStaffGoalTotals(
        {
          ...goalCalculationMock,
          familySize:
            MpdGoalBenefitsConstantSizeEnum.MarriedThreeOrMoreChildren,
        },
        constants,
      ),
    ).toEqual({
      monthlyBudget: expect.closeTo(6738, 0),
      netMonthlySalary: expect.closeTo(6738, 0),
      taxesPercentage: 0.22,
      taxes: expect.closeTo(1482, 0),
      salaryPreIra: expect.closeTo(8220, 0),
      rothContributionPercentage: 0.07,
      traditionalContributionPercentage: 0,
      rothContribution: expect.closeTo(619, 0),
      traditionalContribution: 0,
      grossAnnualSalary: expect.closeTo(106071, 0),
      grossMonthlySalary: expect.closeTo(8839, 0),
      ministryExpensesTotal: 1087.5,
      benefitsCharge: 3286.5,
      overallSubtotal: expect.closeTo(13213, 0),
      overallSubtotalWithAdmin: expect.closeTo(15015, 0),
      attrition: expect.closeTo(901, 0),
      overallTotal: expect.closeTo(15916, 0),
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
      monthlyBudget: expect.closeTo(5506, 0),
      netMonthlySalary: expect.closeTo(5506, 0),
      taxesPercentage: 0.22,
      taxes: expect.closeTo(1211, 0),
      salaryPreIra: expect.closeTo(6718, 0),
      rothContributionPercentage: 0.07,
      traditionalContributionPercentage: 0,
      rothContribution: expect.closeTo(506, 0),
      traditionalContribution: 0,
      grossAnnualSalary: expect.closeTo(86683, 0),
      grossMonthlySalary: expect.closeTo(7224, 0),
      ministryExpensesTotal: 822.5,
      benefitsCharge: 1910.54,
      overallSubtotal: expect.closeTo(9957, 0),
      overallSubtotalWithAdmin: expect.closeTo(11314, 0),
      attrition: expect.closeTo(679, 0),
      overallTotal: expect.closeTo(11993, 0),
    });
  });
});
