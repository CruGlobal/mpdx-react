import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { BudgetFamilyFragment } from './GoalCalculation.generated';
import type { ListGoalCalculationFragment } from '../GoalsList/GoalCalculations.generated';

const toPercentage = (value: number | null | undefined) => (value ?? 0) / 100;

export interface GoalTotals {
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
  overallTotal: number;
}

export const calculateGoalTotals = (
  goalCalculation: ListGoalCalculationFragment | null,
): GoalTotals => {
  const netPaycheckAmount = goalCalculation?.netPaycheckAmount ?? 0;
  const spouseNetPaycheckAmount = goalCalculation?.spouseNetPaycheckAmount ?? 0;
  const totalNetPaycheckAmount = netPaycheckAmount + spouseNetPaycheckAmount;
  const taxesPercentage = toPercentage(goalCalculation?.taxesPercentage);
  const spouseTaxesPercentage = toPercentage(
    goalCalculation?.spouseTaxesPercentage,
  );
  const paySplitPercentage = netPaycheckAmount / totalNetPaycheckAmount || 1;
  const spousePaySplitPercentage = 1 - paySplitPercentage;
  const totalTaxesPercentage =
    paySplitPercentage * taxesPercentage +
    spousePaySplitPercentage * spouseTaxesPercentage;

  const specialIncomeCategory =
    goalCalculation?.specialFamily.primaryBudgetCategories.find(
      (category) =>
        category.category === PrimaryBudgetCategoryEnum.SpecialIncome,
    );
  const additionalIncome = specialIncomeCategory
    ? calculateCategoryTotal(specialIncomeCategory)
    : 0;
  const netMonthlySalary =
    (goalCalculation
      ? calculateFamilyTotal(goalCalculation.householdFamily)
      : 0) - additionalIncome;
  const taxes = netMonthlySalary * totalTaxesPercentage;
  const salaryPreIra = netMonthlySalary + taxes;

  const rothContributionPercentage =
    toPercentage(goalCalculation?.rothContributionPercentage) *
      paySplitPercentage +
    toPercentage(goalCalculation?.spouseRothContributionPercentage) *
      spousePaySplitPercentage;
  const traditionalContributionPercentage =
    toPercentage(goalCalculation?.traditionalContributionPercentage) *
      paySplitPercentage +
    toPercentage(goalCalculation?.spouseTraditionalContributionPercentage) *
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
  const benefitsCharge = goalCalculation ? 1008.6 : 0; /* TODO: mocked data */
  const overallSubtotal = grossMonthlySalary + benefitsCharge;
  const overallSubtotalWithAdmin = overallSubtotal / 0.88;
  const overallTotal = overallSubtotalWithAdmin * 1.06;

  return {
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
