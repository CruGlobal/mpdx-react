import { DateTime } from 'luxon';

export const defaultStartDate = (): string =>
  DateTime.local().minus({ months: 1 }).plus({ days: 1 }).toISODate();

export const defaultEndDate = (): string => DateTime.local().toISODate();

/**
 * Converts the "amount" string to a number to remove ".0"
 * If the value is 0 or isExpense is true, it returns the value as is.
 * Otherwise, it removes the '-' character if present, or prepends it if absent.
 */
export const formatTransactionAmount = (
  amount?: string | null,
  isExpense?: boolean,
): number => {
  if (!amount) {
    return 0;
  }

  if (amount === '0' || isExpense) {
    return Number(amount);
  }
  return -Number(amount);
};
