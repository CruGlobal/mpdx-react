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
  ReimbursableTotals,
  calculateReimbursableTotals,
} from './reimbursableExpenses';
import {
  SalaryConstants,
  SalaryTotals,
  calculateSalaryTotals,
} from './salaryCalculation';

interface PdsSummaryData {
  salaryTotals: SalaryTotals;
  salaryConstants: SalaryConstants;
  reimbursableTotals: ReimbursableTotals;
  otherTotals: OtherExpensesTotals;
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

    const additionalRates = goalMiscConstants.ADDITIONAL_RATES;
    const employerFicaRate = additionalRates?.EMPLOYER_FICA_RATE?.fee;
    const workCompPercentage =
      additionalRates?.PART_TIME_WORK_COMPENSATION?.fee;
    const attritionRate = goalMiscConstants.RATES?.ATTRITION_RATE?.fee;
    const creditCardFeeRate = additionalRates?.CREDIT_CARD_FEE_RATE?.fee;
    const adminRate = goalMiscConstants.RATES?.ADMIN_RATE?.fee;

    if (
      employerFicaRate === undefined ||
      workCompPercentage === undefined ||
      attritionRate === undefined ||
      creditCardFeeRate === undefined ||
      adminRate === undefined
    ) {
      return null;
    }

    const geographicMultiplier =
      goalGeographicConstantMap.get(calculation.geographicLocation ?? '') ?? 0;

    const salaryConstants: SalaryConstants = {
      geographicMultiplier,
      employerFicaRate,
    };
    const salaryTotals = calculateSalaryTotals(calculation, salaryConstants);
    const reimbursableTotals = calculateReimbursableTotals(calculation);

    const taxDeferredPct =
      (hcmUser?.fourOThreeB?.currentTaxDeferredContributionPercentage ?? 0) /
      100;
    const rothPct =
      (hcmUser?.fourOThreeB?.currentRothContributionPercentage ?? 0) / 100;

    const otherConstants: OtherExpensesConstants = {
      reimbursableTotal: reimbursableTotals.total,
      salarySubtotal: salaryTotals.subtotal,
      fourOThreeBPercentage: taxDeferredPct + rothPct,
      grossMonthlyPay: salaryTotals.grossMonthlyPay,
      workCompPercentage,
      attritionRate,
      creditCardFeeRate,
      adminRate,
    };
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
      geographicMultiplier,
    };
  }, [calculation, hcmUser, goalMiscConstants, goalGeographicConstantMap]);
};
