import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { goalCalculationMock } from '../GoalCalculatorTestWrapper';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
} from './GoalCalculation.generated';
import {
  calculateCategoryEnumTotal,
  calculateCategoryTotal,
  calculateFamilyTotal,
  calculateGoalTotals,
} from './calculateTotals';

const mockFamily = gqlMock<BudgetFamilyFragment>(BudgetFamilyFragmentDoc, {
  mocks: {
    primaryBudgetCategories: [
      {
        category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        directInput: 20,
        subBudgetCategories: [{ amount: 100 }, { amount: 200 }],
      },
      {
        category: PrimaryBudgetCategoryEnum.MinistryTravel,
        directInput: null,
        subBudgetCategories: [{ amount: 300 }, { amount: 400 }],
      },
    ],
  },
});

describe('calculateGoalTotals', () => {
  const benefitsPlans = [
    {
      plan: MpdGoalBenefitsConstantPlanEnum.Base,
      size: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
      cost: 1910.54,
    },
    {
      plan: MpdGoalBenefitsConstantPlanEnum.Base,
      size: MpdGoalBenefitsConstantSizeEnum.Single,
      cost: 1008.6,
    },
  ];

  it('should calculate goal totals correctly', () => {
    expect(calculateGoalTotals(goalCalculationMock, benefitsPlans)).toEqual({
      additionalIncome: 1000,
      monthlyBudget: 5500,
      netMonthlySalary: 4500,
      taxesPercentage: expect.closeTo(0.209, 3),
      taxes: expect.closeTo(940),
      salaryPreIra: expect.closeTo(5440),
      rothContributionPercentage: expect.closeTo(0.1111, 4),
      traditionalContributionPercentage: expect.closeTo(0.0633, 4),
      rothContribution: expect.closeTo(680, 0),
      traditionalContribution: expect.closeTo(368, 0),
      grossAnnualSalary: expect.closeTo(77854, 0),
      grossMonthlySalary: expect.closeTo(6488, 0),
      ministryExpensesTotal: 5000,
      benefitsCharge: 1910.54,
      overallSubtotal: expect.closeTo(13398, 0),
      overallSubtotalWithAdmin: expect.closeTo(15225, 0),
      attrition: expect.closeTo(914, 0),
      overallTotal: expect.closeTo(16139, 0),
    });
  });

  it('should ignore spouse fields when the person is single or SOSA', () => {
    const goalCalculation = {
      ...goalCalculationMock,
      familySize: MpdGoalBenefitsConstantSizeEnum.Single,
    };
    expect(calculateGoalTotals(goalCalculation, benefitsPlans)).toEqual({
      additionalIncome: 1000,
      monthlyBudget: 5500,
      netMonthlySalary: 4500,
      taxesPercentage: 0.2,
      taxes: 900,
      salaryPreIra: 5400,
      rothContributionPercentage: 0.12,
      traditionalContributionPercentage: 0.05,
      rothContribution: expect.closeTo(736, 0),
      traditionalContribution: expect.closeTo(284, 0),
      grossAnnualSalary: expect.closeTo(77047, 0),
      grossMonthlySalary: expect.closeTo(6421, 0),
      ministryExpensesTotal: 5000,
      benefitsCharge: 1008.6,
      overallSubtotal: expect.closeTo(12429, 0),
      overallSubtotalWithAdmin: expect.closeTo(14124, 0),
      attrition: expect.closeTo(847, 0),
      overallTotal: expect.closeTo(14972, 0),
    });
  });

  it('handles spouse paid more', () => {
    const goalCalculation = {
      ...goalCalculationMock,
      spouseNetPaycheckAmount: 3000,
    };
    expect(calculateGoalTotals(goalCalculation, benefitsPlans)).toEqual({
      additionalIncome: 1000,
      monthlyBudget: 5500,
      netMonthlySalary: 4500,
      taxesPercentage: expect.closeTo(0.211, 3),
      taxes: expect.closeTo(949, 0),
      salaryPreIra: expect.closeTo(5449, 0),
      rothContributionPercentage: expect.closeTo(0.1091, 4),
      traditionalContributionPercentage: expect.closeTo(0.0664, 4),
      rothContribution: expect.closeTo(667, 0),
      traditionalContribution: expect.closeTo(387, 0),
      grossAnnualSalary: expect.closeTo(78044, 0),
      grossMonthlySalary: expect.closeTo(6504, 0),
      ministryExpensesTotal: 5000,
      benefitsCharge: 1910.54,
      overallSubtotal: expect.closeTo(13414, 0),
      overallSubtotalWithAdmin: expect.closeTo(15243, 0),
      attrition: expect.closeTo(915, 0),
      overallTotal: expect.closeTo(16158, 0),
    });
  });

  it('handles no retirement contribution', () => {
    const goalCalculation = {
      ...goalCalculationMock,
      rothContributionPercentage: 0,
      spouseRothContributionPercentage: 0,
      traditionalContributionPercentage: 0,
      spouseTraditionalContributionPercentage: 0,
    };
    expect(calculateGoalTotals(goalCalculation, benefitsPlans)).toEqual({
      additionalIncome: 1000,
      monthlyBudget: 5500,
      netMonthlySalary: 4500,
      taxesPercentage: expect.closeTo(0.209, 3),
      taxes: expect.closeTo(940),
      salaryPreIra: expect.closeTo(5440),
      rothContributionPercentage: 0,
      traditionalContributionPercentage: 0,
      rothContribution: 0,
      traditionalContribution: 0,
      grossAnnualSalary: 65280,
      grossMonthlySalary: 5440,
      ministryExpensesTotal: 5000,
      benefitsCharge: 1910.54,
      overallSubtotal: expect.closeTo(12351, 0),
      overallSubtotalWithAdmin: expect.closeTo(14035, 0),
      attrition: expect.closeTo(842, 0),
      overallTotal: expect.closeTo(14877, 0),
    });
  });

  it('returns 0 not NaN for missing goals', () => {
    expect(calculateGoalTotals(null, benefitsPlans)).toEqual({
      additionalIncome: 0,
      monthlyBudget: 0,
      netMonthlySalary: 0,
      taxesPercentage: 0,
      taxes: 0,
      salaryPreIra: 0,
      rothContributionPercentage: 0,
      traditionalContributionPercentage: 0,
      rothContribution: 0,
      traditionalContribution: 0,
      grossAnnualSalary: 0,
      grossMonthlySalary: 0,
      ministryExpensesTotal: 0,
      benefitsCharge: 0,
      overallSubtotal: 0,
      overallSubtotalWithAdmin: 0,
      attrition: 0,
      overallTotal: 0,
    });
  });
});

describe('calculateFamilyTotal', () => {
  it('returns correct sum of all primary category amounts for ministry family with a primaryBudgetCategory directInput value set', () => {
    expect(calculateFamilyTotal({ ...mockFamily, directInput: null })).toBe(
      720,
    );
  });
  it('returns sum of family directInput for ministry family with directInput set', () => {
    expect(calculateFamilyTotal({ ...mockFamily, directInput: 1200 })).toBe(
      1200,
    );
  });
});

describe('calculateCategoryTotal', () => {
  it('returns sum of all subcategory amounts for primary category with directInput set', () => {
    expect(calculateCategoryTotal(mockFamily.primaryBudgetCategories[0])).toBe(
      20,
    );
  });

  it('returns sum of all subcategory amounts for primary category without directInput set', () => {
    expect(calculateCategoryTotal(mockFamily.primaryBudgetCategories[1])).toBe(
      700,
    );
  });
});

describe('calculateCategoryEnumTotal', () => {
  it('returns the category total', () => {
    expect(
      calculateCategoryEnumTotal(
        mockFamily,
        PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
      ),
    ).toBe(20);
  });

  it('returns 0 when the category is not found', () => {
    expect(
      calculateCategoryEnumTotal(
        mockFamily,
        PrimaryBudgetCategoryEnum.MinistryOther,
      ),
    ).toBe(0);
  });

  it('returns 0 when family is null', () => {
    expect(
      calculateCategoryEnumTotal(
        null,
        PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
      ),
    ).toBe(0);
  });
});
