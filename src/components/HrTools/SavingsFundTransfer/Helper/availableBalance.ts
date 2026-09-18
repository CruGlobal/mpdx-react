import { FundFieldsFragment } from '../ReportsSavingsFund.generated';

// The lowest a source account balance may go after a transfer. Per
// MPDX-10004 a transfer may never take an account below $0 — fund deficit
// limits apply to salary, not savings fund transfers. If that rule ever
// loosens to allow a deficit, confirm the sign convention of
// `deficitLimit` first: BalanceCard formerly treated it as a negative
// floor (endBalance <= deficitLimit) while TransferModal's old warning
// treated it as a positive magnitude, and mocks with both conventions
// exist in the repo.
export const minimumAllowedBalance = (_fund: FundFieldsFragment): number => 0;

// The most that can be transferred out of a fund right now.
export const availableBalance = (fund: FundFieldsFragment): number =>
  fund.endBalance - minimumAllowedBalance(fund);

// Compare money at cent precision: fund balances are floats and can carry
// sub-cent noise that would otherwise reject the exact amount the UI
// displays as available.
export const toCents = (amount: number): number => Math.round(amount * 100);
