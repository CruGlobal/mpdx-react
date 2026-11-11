import { TFunction } from 'i18next';
import {
  MpdHealthStatusEnum,
  MpdHouseholdTypeEnum,
} from 'src/graphql/types.generated';
import { currencyFormat, monthYearFormat } from 'src/lib/intlFormat';

/**
 * A month-end balance's status in words, for the color key, the team cards
 * and screen readers. The API grades each month against the household's
 * buffer: below $0, below the buffer, or at or above it.
 */
export const balanceStatusLabel = (
  t: TFunction,
  status: MpdHealthStatusEnum,
): string => {
  switch (status) {
    case MpdHealthStatusEnum.Green:
      return t('At or above buffer');
    case MpdHealthStatusEnum.Yellow:
      return t('Below buffer');
    case MpdHealthStatusEnum.Red:
      return t('Below $0');
    case MpdHealthStatusEnum.Blue:
      return t('Not graded');
    case MpdHealthStatusEnum.Gray:
    default:
      return t('No data');
  }
};

export const householdTypeLabel = (
  t: TFunction,
  householdType: MpdHouseholdTypeEnum,
): string => {
  switch (householdType) {
    case MpdHouseholdTypeEnum.Family:
      return t('Family');
    case MpdHouseholdTypeEnum.Couple:
      return t('Couple');
    case MpdHouseholdTypeEnum.Single:
      return t('Single');
  }
};

/** "Oct 2026" for the API's "2026-10", or "October 2026" in full */
export const balanceMonthLabel = (
  month: string,
  locale: string,
  fullMonth = false,
): string => {
  const [year, monthNumber] = month.split('-').map(Number);
  return monthYearFormat(monthNumber, year, locale, true, fullMonth);
};

/** The column headers, from any row: every row covers the same months. */
export const balanceMonthHeaders = (
  t: TFunction,
  balances: Array<{ month: string }>,
  locale: string,
): Array<{ label: string; tooltip: string }> =>
  balances.map(({ month }) => ({
    label: balanceMonthLabel(month, locale),
    tooltip: t('Staff account balance at the end of {{month}}', {
      month: balanceMonthLabel(month, locale, true),
    }),
  }));

/** Whole dollars, so a large balance still fits its column: "$12,346" */
export const formatWholeDollars = (amount: number, locale: string): string =>
  currencyFormat(amount, 'USD', locale, { fractionDigits: 0 });

/** The chip text: the balance, or a dash when the month has none. */
export const balanceAmountLabel = (
  endBalance: number | null | undefined,
  locale: string,
): string =>
  typeof endBalance === 'number' ? formatWholeDollars(endBalance, locale) : '-';
