import { useMemo } from 'react';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import {
  UseGoalCalculatorConstantsResult,
  useGoalCalculatorConstants,
} from 'src/hooks/useGoalCalculatorConstants';
import { PdsGoalCalculationFieldsFragment } from '../GoalsList/PdsGoalCalculations.generated';
import {
  OtherExpensesConstants,
  OtherExpensesTotals,
  calculateOtherExpenses,
} from './OtherExpenses';
import {
  buildOtherExpensesConstants,
  buildPdsGoalConstants,
} from './pdsGoalConstants';
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
  reimbursableTotals: ReimbursableTotals;
  otherTotals: OtherExpensesTotals;
  otherConstants: OtherExpensesConstants;
  overallTotal: number;
  geographicMultiplier: number;
}

export interface UsePdsSummaryDataResult {
  data: PdsSummaryData | null;
  constants: UseGoalCalculatorConstantsResult;
}

export const usePdsSummaryData = (
  calculation: PdsGoalCalculationFieldsFragment | undefined,
  hcmUser: HcmQuery['hcm'][number] | undefined,
): UsePdsSummaryDataResult => {
  const calculatorConstants = useGoalCalculatorConstants(
    calculation?.calculationsYear,
    { skip: !calculation },
  );
  const { goalMiscConstants, goalGeographicConstantMap, unavailable } =
    calculatorConstants;

  const data = useMemo(() => {
    if (!calculation || unavailable) {
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
      calculation.formType ?? DesignationSupportFormType.Detailed,
      constants,
      salaryTotals,
      reimbursableTotals.total,
    );
    const otherTotals = calculateOtherExpenses(calculation, otherConstants);

    const overallTotal =
      otherTotals.combinedSubtotal +
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
  }, [
    calculation,
    hcmUser,
    goalMiscConstants,
    goalGeographicConstantMap,
    unavailable,
  ]);

  return { data, constants: calculatorConstants };
};
