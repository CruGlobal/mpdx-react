import { FundFieldsFragment } from '../ReportsSavingsFund.generated';

// The lowest a source account balance may go after a transfer: the fund's
// deficitLimit (per review on MPDX-10004), treated as a floor value the way
// BalanceCard's endBalance <= deficitLimit check does, defaulting to $0 when
// the fund has no limit.
export const minimumAllowedBalance = (fund: FundFieldsFragment): number =>
  fund.deficitLimit ?? 0;

// The most that can be transferred out of a fund right now.
export const availableBalance = (fund: FundFieldsFragment): number =>
  fund.endBalance - minimumAllowedBalance(fund);

// Compare money at cent precision: fund balances are floats and can carry
// sub-cent noise that would otherwise reject the exact amount the UI
// displays as available.
export const toCents = (amount: number): number => Math.round(amount * 100);
