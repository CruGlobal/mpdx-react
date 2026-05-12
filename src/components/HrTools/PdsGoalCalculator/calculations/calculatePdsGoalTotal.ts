import { DesignationSupportFormType } from 'src/graphql/types.generated';
import {
  GoalGeographicConstantMap,
  GoalMiscConstants,
} from 'src/hooks/useGoalCalculatorConstants';
import { HcmUserQuery } from '../Shared/HCM.generated';
import { isSimpleFormType } from '../Shared/formType';
import {
  OtherExpensesConstants,
  OtherExpensesFields,
  calculateOtherExpenses,
} from './OtherExpenses';
import {
  ReimbursableCalculationFields,
  calculateReimbursableTotals,
} from './reimbursableExpenses';
import {
  SalaryCalculationFields,
  SalaryTotals,
  calculateSalaryTotals,
} from './salaryCalculation';

export type PdsGoalTotalFields = SalaryCalculationFields &
  ReimbursableCalculationFields &
  OtherExpensesFields;

export interface PdsGoalTotalConstants {
  employerFicaRate: number;
  workCompPercentage: number;
  attritionRate: number;
  creditCardFeeRate: number;
  adminRate: number;
  fourOThreeBPercentage: number;
  geographicMultiplier: number;
}

type FourOThreeB = NonNullable<HcmUserQuery['hcm'][number]['fourOThreeB']>;

export const buildPdsGoalConstants = (
  goalMiscConstants: GoalMiscConstants,
  goalGeographicConstantMap: GoalGeographicConstantMap,
  geographicLocation: string | null | undefined,
  fourOThreeB: FourOThreeB | null | undefined,
): PdsGoalTotalConstants | null => {
  const additionalRates = goalMiscConstants.ADDITIONAL_RATES;
  const rates = goalMiscConstants.RATES;

  const employerFicaRate = additionalRates?.EMPLOYER_FICA_RATE?.fee;
  const workCompPercentage = additionalRates?.PART_TIME_WORK_COMPENSATION?.fee;
  const attritionRate = rates?.ATTRITION_RATE?.fee;
  const creditCardFeeRate = additionalRates?.CREDIT_CARD_FEE_RATE?.fee;
  const adminRate = rates?.ADMIN_RATE?.fee;

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
    goalGeographicConstantMap.get(geographicLocation ?? '') ?? 0;

  const taxDeferredPct =
    (fourOThreeB?.currentTaxDeferredContributionPercentage ?? 0) / 100;
  const rothPct = (fourOThreeB?.currentRothContributionPercentage ?? 0) / 100;

  return {
    employerFicaRate,
    workCompPercentage,
    attritionRate,
    creditCardFeeRate,
    adminRate,
    fourOThreeBPercentage: taxDeferredPct + rothPct,
    geographicMultiplier,
  };
};

export const buildOtherExpensesConstants = (
  formType: DesignationSupportFormType,
  constants: PdsGoalTotalConstants,
  salaryTotals: SalaryTotals,
  reimbursableTotal: number,
): OtherExpensesConstants => {
  const isSimple = isSimpleFormType(formType);
  return {
    reimbursableTotal: isSimple ? 0 : reimbursableTotal,
    salarySubtotal: salaryTotals.subtotal,
    fourOThreeBPercentage: isSimple ? 0 : constants.fourOThreeBPercentage,
    grossMonthlyPay: salaryTotals.grossMonthlyPay,
    workCompPercentage: constants.workCompPercentage,
    attritionRate: constants.attritionRate,
    creditCardFeeRate: constants.creditCardFeeRate,
    adminRate: constants.adminRate,
  };
};

export const calculatePdsGoalTotal = (
  calculation: PdsGoalTotalFields,
  constants: PdsGoalTotalConstants,
): number => {
  const salaryTotals = calculateSalaryTotals(calculation, {
    geographicMultiplier: constants.geographicMultiplier,
    employerFicaRate: constants.employerFicaRate,
  });

  const reimbursableTotal = calculateReimbursableTotals(calculation).total;

  const otherExpenses = calculateOtherExpenses(
    calculation,
    buildOtherExpensesConstants(
      calculation.formType ?? DesignationSupportFormType.Detailed,
      constants,
      salaryTotals,
      reimbursableTotal,
    ),
  );

  return otherExpenses.assessment;
};
