import { TFunction } from 'i18next';
import { currencyFormat } from 'src/lib/intlFormat';

// The info tooltip beside the available amount names the numbers behind it
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
