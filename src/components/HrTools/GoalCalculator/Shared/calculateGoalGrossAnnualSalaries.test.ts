import { MpdGoalBenefitsConstantSizeEnum } from 'src/graphql/types.generated';
import { formatConstants } from 'src/hooks/useGoalCalculatorConstants';
import {
  constantsMock,
  goalCalculationMock,
} from '../GoalCalculatorTestWrapper';
import {
  calculateGoalGrossAnnualSalaries,
  calculateGoalTotals,
} from './calculateTotals';

describe('calculateGoalGrossAnnualSalaries', () => {
  const constants = formatConstants(constantsMock);

  it("splits the household gross annual salary by each person's share of the net paychecks", () => {
    const { grossAnnualSalary, spouseGrossAnnualSalary } =
      calculateGoalGrossAnnualSalaries(goalCalculationMock);

    expect(grossAnnualSalary).toBeCloseTo(77854 * (2500 / 4500), 0);
    expect(spouseGrossAnnualSalary).toBeCloseTo(77854 * (2000 / 4500), 0);
    expect(grossAnnualSalary + spouseGrossAnnualSalary).toBeCloseTo(
      calculateGoalTotals(goalCalculationMock, constants).grossAnnualSalary,
    );
  });

  it('gives the whole salary to a single staff member', () => {
    const goalCalculation = {
      ...goalCalculationMock,
      familySize: MpdGoalBenefitsConstantSizeEnum.Single,
    };

    expect(calculateGoalGrossAnnualSalaries(goalCalculation)).toEqual({
      grossAnnualSalary: expect.closeTo(77047, 0),
      spouseGrossAnnualSalary: 0,
    });
  });

  it('uses the net paycheck split when the household budget is entered directly', () => {
    const goalCalculation = {
      ...goalCalculationMock,
      householdFamily: {
        ...goalCalculationMock.householdFamily,
        directInput: 9000,
      },
    };
    const { grossAnnualSalary, spouseGrossAnnualSalary } =
      calculateGoalGrossAnnualSalaries(goalCalculation);

    expect(grossAnnualSalary / spouseGrossAnnualSalary).toBeCloseTo(
      2500 / 2000,
    );
    expect(grossAnnualSalary + spouseGrossAnnualSalary).toBeCloseTo(
      calculateGoalTotals(goalCalculation, constants).grossAnnualSalary,
    );
  });

  it('gives the whole salary to the spouse when only the spouse has a paycheck', () => {
    const goalCalculation = { ...goalCalculationMock, netPaycheckAmount: 0 };
    const { grossAnnualSalary, spouseGrossAnnualSalary } =
      calculateGoalGrossAnnualSalaries(goalCalculation);

    expect(grossAnnualSalary).toBe(0);
    expect(spouseGrossAnnualSalary).toBeCloseTo(
      calculateGoalTotals(goalCalculation, constants).grossAnnualSalary,
    );
  });

  it('returns 0 for a goal with no salary', () => {
    expect(calculateGoalGrossAnnualSalaries(null)).toEqual({
      grossAnnualSalary: 0,
      spouseGrossAnnualSalary: 0,
    });
  });
});
