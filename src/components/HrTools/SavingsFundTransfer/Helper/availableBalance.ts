import { FundFieldsFragment } from '../ReportsSavingsFund.generated';

// How far below zero SAA lets the fund go. SAA enforces
// balance - amount >= -(deficit_limit).abs on every withdrawal
// (staff_accounting_app Fund#withdrawal_would_violate_deficit?), so the
// stored sign carries no meaning and this is always positive — same shape as
// asr_max_calculation on the API (mpdx_api#3666).
export const minimumAllowedBalance = (
  fund: Pick<FundFieldsFragment, 'deficitLimit'>,
): number => (fund.deficitLimit ? Math.abs(fund.deficitLimit) : 0);

// The most that can be transferred out of a fund right now. The API computes
// this net of pending obligations — scheduled transfers out of the fund and
// both spouses' unpaid ASRs (mpdx_api Reports::FundAvailableBalance) — so its
// value wins. Null means the API could not or should not compute it (a
// historical report window, or an unresolvable household), so fall back to
// the local balance + allowed-deficit math.
export const availableBalance = (
  fund: Pick<
    FundFieldsFragment,
    'availableBalance' | 'endBalance' | 'deficitLimit'
  >,
): number =>
  fund.availableBalance ?? fund.endBalance + minimumAllowedBalance(fund);

// Compare money at cent precision: fund balances are floats and can carry
// sub-cent noise that would otherwise reject the exact amount the UI
// displays as available.
export const toCents = (amount: number): number => Math.round(amount * 100);
