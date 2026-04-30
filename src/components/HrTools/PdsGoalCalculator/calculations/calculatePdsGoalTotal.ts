import { PdsGoalCalculationFieldsFragment } from '../GoalsList/PdsGoalCalculations.generated';
import { calculateOtherExpenses } from './OtherExpenses';
import { calculateReimbursableTotals } from './reimbursableExpenses';
import { calculateSalaryTotals } from './salaryCalculation';

export interface PdsGoalTotalConstants {
  employerFicaRate: number;
  workCompPercentage: number;
  attritionRate: number;
  creditCardFeeRate: number;
  adminRate: number;
  fourOThreeBPercentage: number;
  geographicMultiplier: number;
}

export const calculatePdsGoalTotal = (
  calculation: PdsGoalCalculationFieldsFragment,
  constants: PdsGoalTotalConstants,
): number => {
  const salaryTotals = calculateSalaryTotals(calculation, {
    geographicMultiplier: constants.geographicMultiplier,
    employerFicaRate: constants.employerFicaRate,
  });

  const reimbursableTotals = calculateReimbursableTotals(calculation);

  const otherExpenses = calculateOtherExpenses(calculation, {
    reimbursableTotal: reimbursableTotals.total,
    salarySubtotal: salaryTotals.subtotal,
    fourOThreeBPercentage: constants.fourOThreeBPercentage,
    grossMonthlyPay: salaryTotals.grossMonthlyPay,
    workCompPercentage: constants.workCompPercentage,
    attritionRate: constants.attritionRate,
    creditCardFeeRate: constants.creditCardFeeRate,
    adminRate: constants.adminRate,
  });

  return otherExpenses.assessment;
};
