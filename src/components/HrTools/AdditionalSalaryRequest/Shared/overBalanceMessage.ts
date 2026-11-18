import { TFunction } from 'i18next';
import { currencyFormat } from 'src/lib/intlFormat';

// Names the numbers behind the available amount, so a refused total explains itself
export const overBalanceMessage = (
  t: TFunction,
  locale: string,
  available: number,
  unpaidTotal: number,
): string => {
  const format = (amount: number) =>
    currencyFormat(amount, 'USD', locale, { showTrailingZeros: true });

  return unpaidTotal
    ? t(
        'Exceeds the {{available}} available for this request (balance plus deficit limit, minus {{unpaid}} in other unpaid requests).',
        { available: format(available), unpaid: format(unpaidTotal) },
      )
    : t(
        'Exceeds the {{available}} available for this request (balance plus deficit limit).',
        { available: format(available) },
      );
};
