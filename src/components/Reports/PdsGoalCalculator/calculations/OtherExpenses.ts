import { DesignationSupportStatus } from 'src/graphql/types.generated';

export interface OtherExpensesFields {
  status?: DesignationSupportStatus | null;
  benefits?: number | null;
}

export interface OtherExpensesConstants {
  reimbursableTotal: number;
  salarySubtotal: number;
  fourOThreeBPercentage: number;
  grossMonthlyPay: number;
  workCompPercentage: number;
  attritionRate: number;
  creditCardFeeRate: number;
  adminRate: number;
}

export interface OtherExpensesTotals {
  reimbursableExpenses: number;
  fourOThreeBContributions: number;
  workComp: number;
  benefits: number;
  subtotal: number;
  attrition: number;
  creditCardFees: number;
  assessment: number;
}

export const calculateOtherExpenses = (
  calculation: OtherExpensesFields,
  constants: OtherExpensesConstants,
): OtherExpensesTotals => {
  const isPartTime = calculation.status === DesignationSupportStatus.PartTime;
  const isFullTime = calculation.status === DesignationSupportStatus.FullTime;

  const reimbursableExpenses = constants.reimbursableTotal;
  const fourOThreeBContributions =
    constants.grossMonthlyPay * constants.fourOThreeBPercentage;
  const workComp = isPartTime
    ? constants.grossMonthlyPay * constants.workCompPercentage
    : 0;
  const benefits = isFullTime ? (calculation.benefits ?? 0) : 0;

  const subtotal =
    constants.salarySubtotal +
    reimbursableExpenses +
    fourOThreeBContributions +
    workComp +
    benefits;

  const attrition = subtotal * constants.attritionRate;
  const creditCardFees = (subtotal + attrition) * constants.creditCardFeeRate;
  const adminRate = constants.adminRate;
  const assessment = (subtotal + creditCardFees + attrition) * adminRate;

  return {
    reimbursableExpenses,
    fourOThreeBContributions,
    workComp,
    benefits,
    subtotal,
    attrition,
    creditCardFees,
    assessment,
  };
};
