import { FundFieldsFragment } from '../ReportsSavingsFund.generated';

// How far below zero SAA lets the fund go. SAA enforces
// balance - amount >= -(deficit_limit).abs on every withdrawal
// (staff_accounting_app Fund#withdrawal_would_violate_deficit?), so the
// stored sign carries no meaning and this is always positive — same shape as
// asr_max_calculation on the API (mpdx_api#3666).
export const minimumAllowedBalance = (fund: FundFieldsFragment): number =>
  fund.deficitLimit ? Math.abs(fund.deficitLimit) : 0;

// The most that can be transferred out of a fund right now.
export const availableBalance = (fund: FundFieldsFragment): number =>
  fund.endBalance + minimumAllowedBalance(fund);

// Compare money at cent precision: fund balances are floats and can carry
// sub-cent noise that would otherwise reject the exact amount the UI
// displays as available.
export const toCents = (amount: number): number => Math.round(amount * 100);
