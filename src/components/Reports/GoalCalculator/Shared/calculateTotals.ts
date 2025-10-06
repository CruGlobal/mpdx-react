import {
  MpdGoalBenefitsConstant,
  MpdGoalBenefitsConstantSizeEnum,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { BudgetFamilyFragment } from './GoalCalculation.generated';
import type { ListGoalCalculationFragment } from '../GoalsList/GoalCalculations.generated';

const toPercentage = (value: number | null | undefined) => (value ?? 0) / 100;

export const hasStaffSpouse = (
  familySize: MpdGoalBenefitsConstantSizeEnum | null | undefined,
): boolean =>
  familySize === MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren ||
  familySize === MpdGoalBenefitsConstantSizeEnum.MarriedOneToTwoChildren ||
  familySize === MpdGoalBenefitsConstantSizeEnum.MarriedThreeOrMoreChildren;

export interface GoalTotals {
  additionalIncome: number;
  monthlyBudget: number;
  netMonthlySalary: number;
  taxesPercentage: number;
  taxes: number;
  salaryPreIra: number;
  rothContributionPercentage: number;
  traditionalContributionPercentage: number;
  rothContribution: number;
  traditionalContribution: number;
  grossAnnualSalary: number;
  grossMonthlySalary: number;
  benefitsCharge: number;
  ministryExpensesTotal: number;
  overallSubtotal: number;
  overallSubtotalWithAdmin: number;
  attrition: number;
  overallTotal: number;
}

export const calculateGoalTotals = (
  goalCalculation: ListGoalCalculationFragment | null,
  benefitsPlans: Array<Pick<MpdGoalBenefitsConstant, 'size' | 'plan' | 'cost'>>,
): GoalTotals => {
  const married = hasStaffSpouse(goalCalculation?.familySize);
  const netPaycheckAmount = goalCalculation?.netPaycheckAmount ?? 0;
  const spouseNetPaycheckAmount =
    (married ? goalCalculation?.spouseNetPaycheckAmount : null) ?? 0;
  const totalNetPaycheckAmount = netPaycheckAmount + spouseNetPaycheckAmount;
  const taxesPercentage = toPercentage(goalCalculation?.taxesPercentage);
  const spouseTaxesPercentage = toPercentage(
    married ? goalCalculation?.spouseTaxesPercentage : null,
  );
  const paySplitPercentage = netPaycheckAmount / totalNetPaycheckAmount || 1;
  const spousePaySplitPercentage = 1 - paySplitPercentage;
  const totalTaxesPercentage =
    paySplitPercentage * taxesPercentage +
    spousePaySplitPercentage * spouseTaxesPercentage;

  const additionalIncome = calculateCategoryEnumTotal(
    goalCalculation?.specialFamily,
    PrimaryBudgetCategoryEnum.SpecialIncome,
  );

  const monthlyBudget =
    goalCalculation?.householdFamily.directInput ??
    (netPaycheckAmount + spouseNetPaycheckAmount) * 2 + additionalIncome;
  const netMonthlySalary = monthlyBudget - additionalIncome;
  const taxes = netMonthlySalary * totalTaxesPercentage;
  const salaryPreIra = netMonthlySalary + taxes;

  const rothContributionPercentage =
    toPercentage(goalCalculation?.rothContributionPercentage) *
      paySplitPercentage +
    toPercentage(
      married ? goalCalculation?.spouseRothContributionPercentage : null,
    ) *
      spousePaySplitPercentage;
  const traditionalContributionPercentage =
    toPercentage(goalCalculation?.traditionalContributionPercentage) *
      paySplitPercentage +
    toPercentage(
      married ? goalCalculation?.spouseTraditionalContributionPercentage : null,
    ) *
      spousePaySplitPercentage;

  const rothContribution =
    salaryPreIra / (1 - rothContributionPercentage) - salaryPreIra;
  const traditionalContribution =
    salaryPreIra / (1 - traditionalContributionPercentage) - salaryPreIra;
  const grossMonthlySalary =
    salaryPreIra + rothContribution + traditionalContribution;
  const grossAnnualSalary = grossMonthlySalary * 12;

  const ministryExpensesTotal = goalCalculation
    ? calculateFamilyTotal(goalCalculation.ministryFamily)
    : 0;
  const benefitsCharge =
    benefitsPlans.find(
      ({ plan, size }) =>
        plan === goalCalculation?.benefitsPlan &&
        size === goalCalculation?.familySize,
    )?.cost ?? 0;
  const overallSubtotal =
    grossMonthlySalary + ministryExpensesTotal + benefitsCharge;
  const overallSubtotalWithAdmin = overallSubtotal / 0.88;
  const attrition = overallSubtotalWithAdmin * 0.06;
  const overallTotal = overallSubtotalWithAdmin + attrition;

  return {
    additionalIncome,
    monthlyBudget,
    netMonthlySalary,
    taxesPercentage: totalTaxesPercentage,
    taxes,
    salaryPreIra,
    rothContributionPercentage,
    traditionalContributionPercentage,
    rothContribution,
    traditionalContribution,
    grossAnnualSalary,
    grossMonthlySalary,
    ministryExpensesTotal,
    benefitsCharge,
    overallSubtotal,
    overallSubtotalWithAdmin,
    attrition,
    overallTotal,
  };
};
export const calculateFamilyTotal = (family: BudgetFamilyFragment): number => {
  if (typeof family.directInput === 'number') {
    return family.directInput;
  }
  return family.primaryBudgetCategories.reduce(
    (sum: number, primary) => sum + calculateCategoryTotal(primary),
    0,
  );
};

export const calculateCategoryTotal = (
  primary: BudgetFamilyFragment['primaryBudgetCategories'][number],
): number => {
  if (typeof primary.directInput === 'number') {
    return primary.directInput;
  }
  return primary.subBudgetCategories.reduce(
    (sum: number, sub) => sum + sub.amount,
    0,
  );
};

export const calculateCategoryEnumTotal = (
  family: BudgetFamilyFragment | null | undefined,
  categoryEnum: PrimaryBudgetCategoryEnum,
): number => {
  const category = family?.primaryBudgetCategories?.find(
    ({ category }) => category === categoryEnum,
  );
  return category ? calculateCategoryTotal(category) : 0;
};
