import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  GoalCalculationRole,
  MpdGoalBenefitsConstantSizeEnum,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { formatConstants } from 'src/hooks/useGoalCalculatorConstants';
import {
  constantsMock,
  goalCalculationMock,
} from '../GoalCalculatorTestWrapper';
import {
  ListGoalCalculationFragment,
  ListGoalCalculationFragmentDoc,
} from '../GoalsList/GoalCalculations.generated';
import {
  calculateNewStaffGoalTotals,
  getNewStaffBudgetCategory,
} from './calculateNewStaffTotals';

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

  it('handles SOSA with dependents', () => {
    expect(
      calculateNewStaffGoalTotals(
        {
          ...goalCalculationMock,
          familySize: MpdGoalBenefitsConstantSizeEnum.SosaTwoToThreeDependents,
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
      ministryExpensesTotal: 560,
      benefitsCharge: 2350.64,
      overallSubtotal: expect.closeTo(6923, 0),
      overallSubtotalWithAdmin: expect.closeTo(7868, 0),
      attrition: expect.closeTo(472, 0),
      overallTotal: expect.closeTo(8340, 0),
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

describe('getNewStaffBudgetCategory', () => {
  const constants = formatConstants(constantsMock);

  describe('single staff', () => {
    it.each([
      {
        category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        expected: 140,
      },
      {
        category: PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
        expected: 125,
      },
      {
        category: PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
        expected: 50,
      },
      {
        category: PrimaryBudgetCategoryEnum.ReimbursableMedicalExpense,
        expected: 165,
      },
    ])('calculates $category', ({ category, expected }) => {
      const goalCalculation = {
        ...goalCalculationMock,
        familySize: MpdGoalBenefitsConstantSizeEnum.Single,
        role: GoalCalculationRole.Field,
      };
      expect(
        getNewStaffBudgetCategory(
          goalCalculation,
          category,
          constants.goalMiscConstants,
        ),
      ).toBe(expected);
    });
  });

  describe('married staff without children', () => {
    it.each([
      {
        category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        expected: 140,
      },
      {
        category: PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
        expected: 187.5,
      },
      {
        category: PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
        expected: 75,
      },
      {
        category: PrimaryBudgetCategoryEnum.ReimbursableMedicalExpense,
        expected: 330,
      },
    ])('calculates $category', ({ category, expected }) => {
      const goalCalculation = {
        ...goalCalculationMock,
        familySize: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
        role: GoalCalculationRole.Field,
      };
      expect(
        getNewStaffBudgetCategory(
          goalCalculation,
          category,
          constants.goalMiscConstants,
        ),
      ).toBe(expected);
    });
  });

  describe('married staff with children', () => {
    it.each([
      {
        category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        expected: 140,
      },
      {
        category: PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
        expected: 200,
      },
      {
        category: PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
        expected: 75,
      },
      {
        category: PrimaryBudgetCategoryEnum.ReimbursableMedicalExpense,
        expected: 365,
      },
    ])('calculates $category', ({ category, expected }) => {
      const goalCalculation = {
        ...goalCalculationMock,
        familySize: MpdGoalBenefitsConstantSizeEnum.MarriedOneToTwoChildren,
        role: GoalCalculationRole.Field,
      };
      expect(
        getNewStaffBudgetCategory(
          goalCalculation,
          category,
          constants.goalMiscConstants,
        ),
      ).toBe(expected);
    });
  });

  describe('SOSA staff with dependents', () => {
    it.each([
      {
        category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        expected: 140,
      },
      {
        category: PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
        expected: 125,
      },
      {
        category: PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
        expected: 50,
      },
      {
        category: PrimaryBudgetCategoryEnum.ReimbursableMedicalExpense,
        expected: 235,
      },
    ])('calculates $category', ({ category, expected }) => {
      const goalCalculation = {
        ...goalCalculationMock,
        familySize: MpdGoalBenefitsConstantSizeEnum.SosaTwoToThreeDependents,
        role: GoalCalculationRole.Field,
      };
      expect(
        getNewStaffBudgetCategory(
          goalCalculation,
          category,
          constants.goalMiscConstants,
        ),
      ).toBe(expected);
    });
  });

  describe('office staff', () => {
    it.each([
      {
        category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        expected: 70,
      },
      {
        category: PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
        expected: 125,
      },
      {
        category: PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
        expected: 50,
      },
      {
        category: PrimaryBudgetCategoryEnum.ReimbursableMedicalExpense,
        expected: 165,
      },
    ])('calculates $category', ({ category, expected }) => {
      const goalCalculation = {
        ...goalCalculationMock,
        familySize: MpdGoalBenefitsConstantSizeEnum.Single,
        role: GoalCalculationRole.Office,
      };
      expect(
        getNewStaffBudgetCategory(
          goalCalculation,
          category,
          constants.goalMiscConstants,
        ),
      ).toBe(expected);
    });
  });

  describe('other categories use goal calculation totals', () => {
    const goalCalculation = gqlMock<ListGoalCalculationFragment>(
      ListGoalCalculationFragmentDoc,
      {
        mocks: {
          ministryFamily: {
            primaryBudgetCategories: [
              {
                category: PrimaryBudgetCategoryEnum.AccountTransfers,
                directInput: 50,
              },
              {
                category: PrimaryBudgetCategoryEnum.CreditCardProcessingCharges,
                directInput: 100,
              },
            ],
          },
        },
      },
    );

    it.each([
      {
        category: PrimaryBudgetCategoryEnum.AccountTransfers,
        expected: 50,
      },
      {
        category: PrimaryBudgetCategoryEnum.CreditCardProcessingCharges,
        expected: 100,
      },
    ])('calculates $category', ({ category, expected }) => {
      expect(
        getNewStaffBudgetCategory(
          goalCalculation,
          category,
          constants.goalMiscConstants,
        ),
      ).toBe(expected);
    });
  });
});
