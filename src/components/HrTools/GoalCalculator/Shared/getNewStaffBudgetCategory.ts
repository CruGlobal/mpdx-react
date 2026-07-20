import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { GoalCalculationQuery } from './GoalCalculation.generated';
import { calculateCategoryEnumTotal } from './calculateTotals';

/**
 * Look up the New Staff reference amount for a budget category.
 */
export const getNewStaffBudgetCategory = (
  goalCalculation: GoalCalculationQuery['goalCalculation'] | null | undefined,
  category: PrimaryBudgetCategoryEnum,
): number => {
  if (!goalCalculation) {
    return 0;
  }

  const { newStaffCalculations, ministryFamily } = goalCalculation;

  switch (category) {
    case PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage:
      return newStaffCalculations.ministryMiles;
    case PrimaryBudgetCategoryEnum.MinistryTravel:
      return newStaffCalculations.travel;
    case PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences:
      return newStaffCalculations.conferences;
    case PrimaryBudgetCategoryEnum.UsStaffConference:
      // New staff don't raise extra monthly for staff conference. All conference expenses are
      // included in `newStaffCalculations.conferences`.
      return 0;
    case PrimaryBudgetCategoryEnum.MealsAndPerDiem:
      return newStaffCalculations.meals;
    case PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment:
      return newStaffCalculations.mpd;
    case PrimaryBudgetCategoryEnum.SuppliesAndMaterials:
      return newStaffCalculations.supplies;
    case PrimaryBudgetCategoryEnum.ReimbursableMedicalExpenses:
      return newStaffCalculations.medicalExpenses;

    case PrimaryBudgetCategoryEnum.AccountTransfers:
    case PrimaryBudgetCategoryEnum.InternetServiceProviderFee:
    case PrimaryBudgetCategoryEnum.CellPhoneWorkLine:
    case PrimaryBudgetCategoryEnum.CreditCardProcessingCharges:
    case PrimaryBudgetCategoryEnum.SummerAssignmentExpenses:
    case PrimaryBudgetCategoryEnum.MinistryOther:
      return calculateCategoryEnumTotal(ministryFamily, category);

    default:
      return 0;
  }
};
