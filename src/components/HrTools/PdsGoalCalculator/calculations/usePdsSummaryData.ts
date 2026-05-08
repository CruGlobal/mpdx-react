import { useMemo } from 'react';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { PdsGoalCalculationFieldsFragment } from '../GoalsList/PdsGoalCalculations.generated';
import { HcmUserQuery } from '../Shared/HCM.generated';
import {
  OtherExpensesConstants,
  OtherExpensesTotals,
  calculateOtherExpenses,
} from './OtherExpenses';
import {
  buildOtherExpensesConstants,
  buildPdsGoalConstants,
} from './calculatePdsGoalTotal';
import {
  ReimbursableTotals,
  calculateReimbursableTotals,
} from './reimbursableExpenses';
import {
  SalaryConstants,
  SalaryTotals,
  calculateSalaryTotals,
} from './salaryCalculation';

export interface PdsSummaryData {
  salaryTotals: SalaryTotals;
  salaryConstants: SalaryConstants;
  /**
   * Reimbursable totals computed from the saved calculation data, preserved
   * across formType changes so a user switching Detailed → Simple → Detailed
   * doesn't lose what they entered. NOT the effective value used in downstream
   * Other Expenses math — for that, use `otherConstants.reimbursableTotal`,
   * which is zeroed when `formType === Simple`.
   */
  reimbursableTotals: ReimbursableTotals;
  otherTotals: OtherExpensesTotals;
  /**
   * Inputs fed into `calculateOtherExpenses`. `reimbursableTotal` and
   * `fourOThreeBPercentage` here are zeroed when `formType === Simple`
   * (Simple goals exclude reimbursables and 403b from the goal calc), so they
   * differ from `reimbursableTotals.total` and the user's HCM 403b percentages.
   */
  otherConstants: OtherExpensesConstants;
  overallTotal: number;
  geographicMultiplier: number;
}

export const usePdsSummaryData = (
  calculation: PdsGoalCalculationFieldsFragment | undefined,
  hcmUser: HcmUserQuery['hcm'][number] | undefined,
): PdsSummaryData | null => {
  const { goalMiscConstants, goalGeographicConstantMap } =
    useGoalCalculatorConstants();

  return useMemo(() => {
    if (!calculation) {
      return null;
    }

    const constants = buildPdsGoalConstants(
      goalMiscConstants,
      goalGeographicConstantMap,
      calculation.geographicLocation,
      hcmUser?.fourOThreeB,
    );
    if (!constants) {
      return null;
    }

    const salaryConstants: SalaryConstants = {
      geographicMultiplier: constants.geographicMultiplier,
      employerFicaRate: constants.employerFicaRate,
    };
    const salaryTotals = calculateSalaryTotals(calculation, salaryConstants);
    const reimbursableTotals = calculateReimbursableTotals(calculation);

    const otherConstants = buildOtherExpensesConstants(
      calculation.formType,
      constants,
      salaryTotals,
      reimbursableTotals.total,
    );
    const otherTotals = calculateOtherExpenses(calculation, otherConstants);

    const overallTotal =
      otherTotals.subtotal +
      otherTotals.attrition +
      otherTotals.creditCardFees +
      otherTotals.assessment;

    return {
      salaryTotals,
      salaryConstants,
      reimbursableTotals,
      otherTotals,
      otherConstants,
      overallTotal,
      geographicMultiplier: constants.geographicMultiplier,
    };
  }, [calculation, hcmUser, goalMiscConstants, goalGeographicConstantMap]);
};
