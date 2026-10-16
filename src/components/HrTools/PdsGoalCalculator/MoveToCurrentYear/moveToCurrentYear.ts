import { GoalMiscConstants } from 'src/hooks/useGoalCalculatorConstants';
import { PdsGoalCalculationFieldsFragment } from '../GoalsList/PdsGoalCalculations.generated';

export type CappedAmountField = 'ministryCellPhone' | 'ministryInternet';

export interface CappedAmountChange {
  field: CappedAmountField;
  amount: number;
  newMax: number;
  /** The amount is over the new max and will be lowered to it. Otherwise the max went up and the amount stays. */
  lowered: boolean;
}

const getMaxes = (
  goalMiscConstants: GoalMiscConstants,
): Record<CappedAmountField, number | undefined> => {
  const reimbursements = goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM;
  return {
    ministryCellPhone: reimbursements?.PHONE?.fee,
    ministryInternet: reimbursements?.INTERNET?.fee,
  };
};

const cappedAmountFields: CappedAmountField[] = [
  'ministryCellPhone',
  'ministryInternet',
];

export const getCappedAmountChanges = (
  calculation: PdsGoalCalculationFieldsFragment,
  oldMiscConstants: GoalMiscConstants,
  newMiscConstants: GoalMiscConstants,
): CappedAmountChange[] => {
  const oldMaxes = getMaxes(oldMiscConstants);
  const newMaxes = getMaxes(newMiscConstants);

  return cappedAmountFields.flatMap<CappedAmountChange>((field) => {
    const amount = calculation[field];
    const oldMax = oldMaxes[field];
    const newMax = newMaxes[field];
    if (typeof amount !== 'number' || newMax === undefined) {
      return [];
    }
    if (amount > newMax) {
      return [{ field, amount, newMax, lowered: true }];
    }
    if (oldMax !== undefined && newMax > oldMax) {
      return [{ field, amount, newMax, lowered: false }];
    }
    return [];
  });
};

/**
 * The goal as the move mutation will save it: on the current year, with phone
 * and internet lowered to the new max. The API never raises them.
 */
export const buildCurrentYearCalculation = (
  calculation: PdsGoalCalculationFieldsFragment,
  currentYear: number,
  newMiscConstants: GoalMiscConstants,
): PdsGoalCalculationFieldsFragment => {
  const newMaxes = getMaxes(newMiscConstants);
  const moved = { ...calculation, calculationsYear: currentYear };
  cappedAmountFields.forEach((field) => {
    const amount = moved[field];
    const newMax = newMaxes[field];
    if (typeof amount === 'number' && newMax !== undefined) {
      moved[field] = Math.min(amount, newMax);
    }
  });
  return moved;
};
