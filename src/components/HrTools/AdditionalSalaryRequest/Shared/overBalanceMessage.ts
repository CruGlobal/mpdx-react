import { TFunction } from 'i18next';
import { currencyFormat } from 'src/lib/intlFormat';

// The breakdown under the balance card names the numbers behind the available amount
export const overBalanceMessage = (
  t: TFunction,
  locale: string,
  available: number,
): string =>
  t('Exceeds the {{available}} available for this request.', {
    available: currencyFormat(available, 'USD', locale, {
      showTrailingZeros: true,
    }),
  });
