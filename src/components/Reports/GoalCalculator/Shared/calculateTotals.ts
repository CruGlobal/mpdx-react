import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { getFamilyTotal, getPrimaryTotal } from './useReportExpenses/helpers';
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

export const calculateTotals = (
  goalCalculation: ListGoalCalculationFragment | null,
): GoalTotals => {
  const netPaycheckAmount = goalCalculation?.netPaycheckAmount ?? 0;
  const spouseNetPaycheckAmount = goalCalculation?.spouseNetPaycheckAmount ?? 0;
  const totalNetPaycheckAmount = netPaycheckAmount + spouseNetPaycheckAmount;
  const taxesPercentage = toPercentage(goalCalculation?.taxesPercentage);
  const spouseTaxesPercentage = toPercentage(
    goalCalculation?.spouseTaxesPercentage,
  );
  const husbandWeightedTaxPercentage =
    (netPaycheckAmount / totalNetPaycheckAmount) * taxesPercentage;
  const spouseWeightedTaxPercentage =
    (spouseNetPaycheckAmount / totalNetPaycheckAmount) * spouseTaxesPercentage;
  const totalTaxesPercentage =
    husbandWeightedTaxPercentage + spouseWeightedTaxPercentage;

  const specialIncomeCategory =
    goalCalculation?.specialFamily.primaryBudgetCategories.find(
      (category) =>
        category.category === PrimaryBudgetCategoryEnum.SpecialIncome,
    );
  const additionalIncome = specialIncomeCategory
    ? getPrimaryTotal(specialIncomeCategory)
    : 0;
  const netMonthlySalary =
    (goalCalculation ? getFamilyTotal(goalCalculation.householdFamily) : 0) -
    additionalIncome;
  const taxes = netMonthlySalary * totalTaxesPercentage;
  const salaryPreIra = netMonthlySalary + taxes;

  const paySplitPercentage = netPaycheckAmount / totalNetPaycheckAmount;
  const spousePaySplitPercentage = 1 - paySplitPercentage;
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
    ? getFamilyTotal(goalCalculation.ministryFamily)
    : 0;
  const benefitsCharge = 1008.6; /* TODO: mocked data */
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
