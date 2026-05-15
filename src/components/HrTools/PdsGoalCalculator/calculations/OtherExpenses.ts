import {
  DesignationSupportFormType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';

export interface OtherExpensesFields {
  status?: DesignationSupportStatus | null;
  benefits?: number | null;
  formType?: DesignationSupportFormType | null;
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
  const creditCardFees =
    (subtotal + attrition) / (1 - constants.creditCardFeeRate) -
    (subtotal + attrition);
  const adminBase = subtotal + attrition + creditCardFees;
  // Admin assessment is `adminRate` of the post-admin total, not a markup on
  // `adminBase`, so gross up: assessment / (adminBase + assessment) = adminRate.
  const assessment = adminBase / (1 - constants.adminRate) - adminBase;

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
