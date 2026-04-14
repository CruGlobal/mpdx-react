import { DesignationSupportCalculation } from 'src/graphql/types.generated';

export const REIMBURSABLE_FLOOR = 300;

export type ReimbursableCalculationFields = Pick<
  DesignationSupportCalculation,
  | 'ministryCellPhone'
  | 'ministryInternet'
  | 'mpdNewsletter'
  | 'mpdMiscellaneous'
  | 'accountTransfers'
  | 'otherMonthlyReimbursements'
  | 'conferenceRetreatCosts'
  | 'ministryTravelMeals'
  | 'otherAnnualReimbursements'
>;

export interface ReimbursableTotals {
  monthlySubtotal: number;
  annualSubtotal: number;
  raw: number;
  total: number;
  floorApplied: boolean;
}

export const calculateReimbursableTotals = (
  calculation: ReimbursableCalculationFields,
): ReimbursableTotals => {
  const monthlySubtotal =
    (calculation.ministryCellPhone ?? 0) +
    (calculation.ministryInternet ?? 0) +
    (calculation.mpdNewsletter ?? 0) +
    (calculation.mpdMiscellaneous ?? 0) +
    (calculation.accountTransfers ?? 0) +
    (calculation.otherMonthlyReimbursements ?? 0);
  const annualSubtotal =
    (calculation.conferenceRetreatCosts ?? 0) +
    (calculation.ministryTravelMeals ?? 0) +
    (calculation.otherAnnualReimbursements ?? 0);
  const raw = monthlySubtotal + annualSubtotal / 12;
  const total = Math.max(REIMBURSABLE_FLOOR, raw);
  return {
    monthlySubtotal,
    annualSubtotal,
    raw,
    total,
    floorApplied: raw <= REIMBURSABLE_FLOOR,
  };
};
