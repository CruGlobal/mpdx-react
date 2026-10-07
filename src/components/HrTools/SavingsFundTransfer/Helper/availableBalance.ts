import { FundFieldsFragment } from '../ReportsSavingsFund.generated';

// The lowest a source account balance may go after a transfer. SAA stores
// deficitLimit as a positive magnitude and enforces
// `balance - amount >= -deficit_limit.abs` on every withdrawal
// (staff_accounting_app Fund#withdrawal_would_violate_deficit?), so the floor
// is the NEGATIVE of the limit; Math.abs keeps legacy negative-convention
// values correct too. Defaults to a $0 floor when the fund has no limit.
export const minimumAllowedBalance = (fund: FundFieldsFragment): number =>
  fund.deficitLimit ? -Math.abs(fund.deficitLimit) : 0;

// The most that can be transferred out of a fund right now.
export const availableBalance = (fund: FundFieldsFragment): number =>
  fund.endBalance - minimumAllowedBalance(fund);

// Compare money at cent precision: fund balances are floats and can carry
// sub-cent noise that would otherwise reject the exact amount the UI
// displays as available.
export const toCents = (amount: number): number => Math.round(amount * 100);
