import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculationFieldsFragment } from '../GoalsList/PdsGoalCalculations.generated';
import { PdsSummaryData } from '../calculations/usePdsSummaryData';

type Calculation = PdsGoalCalculationFieldsFragment | undefined;

export const isSetupComplete = (calculation: Calculation): boolean => {
  if (!calculation) {
    return false;
  }

  const isSalaried =
    calculation.salaryOrHourly === DesignationSupportSalaryType.Salaried;
  const isPartTime = calculation.status === DesignationSupportStatus.PartTime;

  return Boolean(
    calculation.name &&
      calculation.status &&
      calculation.salaryOrHourly &&
      (calculation.payRate ?? 0) > 0 &&
      (isSalaried || (calculation.hoursWorkedPerWeek ?? 0) > 0) &&
      (isPartTime || (calculation.benefits ?? 0) > 0),
  );
};

// Cells default to null and only become a number when the user types one,
// so we can distinguish "user engaged with this section" from a fresh state.
const isAnyFieldTouched = (
  values: ReadonlyArray<number | null | undefined>,
): boolean => values.some((value) => value !== null && value !== undefined);

export const isMonthlyReimbursableComplete = (
  calculation: Calculation,
): boolean => {
  if (!calculation) {
    return false;
  }
  return isAnyFieldTouched([
    calculation.ministryCellPhone,
    calculation.ministryInternet,
    calculation.mpdNewsletter,
    calculation.mpdMiscellaneous,
    calculation.accountTransfers,
    calculation.otherMonthlyReimbursements,
  ]);
};

export const isAnnualReimbursableComplete = (
  calculation: Calculation,
): boolean => {
  if (!calculation) {
    return false;
  }
  return isAnyFieldTouched([
    calculation.conferenceRetreatCosts,
    calculation.ministryTravelMeals,
    calculation.otherAnnualReimbursements,
  ]);
};

export const isMpdGoalComplete = (
  summaryData: PdsSummaryData | null,
): boolean => !!summaryData && summaryData.overallTotal > 0;
