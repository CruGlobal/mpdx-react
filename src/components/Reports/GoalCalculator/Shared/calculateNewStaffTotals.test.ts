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
      monthlyBudget: expect.closeTo(2550, 0),
      netMonthlySalary: expect.closeTo(2550, 0),
      taxesPercentage: 0.22,
      taxes: expect.closeTo(561, 0),
      salaryPreIra: expect.closeTo(3111, 0),
      rothContributionPercentage: 0.07,
      traditionalContributionPercentage: 0,
      rothContribution: expect.closeTo(234, 0),
      traditionalContribution: 0,
      grossAnnualSalary: expect.closeTo(40142, 0),
      grossMonthlySalary: expect.closeTo(3345, 0),
      ministryExpensesTotal: 490,
      benefitsCharge: 1008.6,
      overallSubtotal: expect.closeTo(4844, 0),
      overallSubtotalWithAdmin: expect.closeTo(5504, 0),
      attrition: expect.closeTo(330, 0),
      overallTotal: expect.closeTo(5835, 0),
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
      monthlyBudget: expect.closeTo(5327, 0),
      netMonthlySalary: expect.closeTo(5327, 0),
      taxesPercentage: 0.22,
      taxes: expect.closeTo(1172, 0),
      salaryPreIra: expect.closeTo(6499, 0),
      rothContributionPercentage: 0.07,
      traditionalContributionPercentage: 0,
      rothContribution: expect.closeTo(489, 0),
      traditionalContribution: 0,
      grossAnnualSalary: expect.closeTo(83852, 0),
      grossMonthlySalary: expect.closeTo(6988, 0),
      ministryExpensesTotal: 822.5,
      benefitsCharge: 1910.54,
      overallSubtotal: expect.closeTo(9721, 0),
      overallSubtotalWithAdmin: expect.closeTo(11046, 0),
      attrition: expect.closeTo(663, 0),
      overallTotal: expect.closeTo(11709, 0),
    });
  });
});
