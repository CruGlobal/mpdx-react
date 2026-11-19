import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { GoalCalculationQuery } from './GoalCalculation.generated';
import { GoalTotals, calculateGoalSubtotals } from './calculateTotals';
import { getNewStaffBudgetCategory } from './getNewStaffBudgetCategory';

// Every category on the MPD Goal ministry-expense lines 3A-3J. Keep in sync with
// `ministryExpenseLines` in useMpdGoalRows so the reference subtotal foots against those lines.
const ministryExpenseCategories = [
  PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
  PrimaryBudgetCategoryEnum.MinistryTravel,
  PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences,
  PrimaryBudgetCategoryEnum.UsStaffConference,
  PrimaryBudgetCategoryEnum.MealsAndPerDiem,
  PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
  PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
  PrimaryBudgetCategoryEnum.SummerAssignmentExpenses,
  PrimaryBudgetCategoryEnum.ReimbursableMedicalExpenses,
  PrimaryBudgetCategoryEnum.AccountTransfers,
  PrimaryBudgetCategoryEnum.InternetServiceProviderFee,
  PrimaryBudgetCategoryEnum.CellPhoneWorkLine,
  PrimaryBudgetCategoryEnum.CreditCardProcessingCharges,
  PrimaryBudgetCategoryEnum.MinistryOther,
];

/**
 * The New Staff Reference goal totals for a goal calculation's household.
 */
export const calculateNewStaffReferenceTotals = (
  goalCalculation: GoalCalculationQuery['goalCalculation'] | null | undefined,
): GoalTotals => {
  const calculations = goalCalculation?.newStaffCalculations;

  const ministryExpensesTotal = ministryExpenseCategories.reduce(
    (sum, category) =>
      sum + getNewStaffBudgetCategory(goalCalculation, category),
    0,
  );

  return {
    monthlyBudget: calculations?.salary ?? 0,
    netMonthlySalary: calculations?.salary ?? 0,
    taxesPercentage: calculations?.secaRate ?? 0,
    taxes: calculations?.seca ?? 0,
    salaryPreIra: calculations?.salarySubtotal ?? 0,
    rothContributionPercentage: calculations?.contribution403bPercentage ?? 0,
    traditionalContributionPercentage: 0,
    rothContribution: calculations?.totalContributing403bAmount ?? 0,
    traditionalContribution: 0,
    // The client-entered categories above are folded into ministryExpensesTotal, so the server's
    // goal subtotal (which excludes them) is no longer accurate. Re-calculate the totals client-side.
    ...calculateGoalSubtotals({
      grossMonthlySalary: calculations?.totalSalary ?? 0,
      ministryExpensesTotal,
      benefitsCharge: calculations?.benefitsCharge ?? 0,
      adminRate: calculations?.adminRate ?? 0,
      attritionRate: calculations?.attritionRate ?? 0,
    }),
  };
};
