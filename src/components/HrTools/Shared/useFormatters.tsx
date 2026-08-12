import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';

export const useFormatters = () => {
  const locale = useLocale();

  const formatCurrency = (value: number | null | undefined) =>
    currencyFormat(value ?? 0, 'USD', locale, {
      fractionDigits: 2,
      showTrailingZeros: true,
    });

  const formatFraction = (
    value: number | null | undefined,
    fractionDigits = 2,
  ) => percentageFormat(value ?? 0, locale, { fractionDigits });

  const formatPercentage = (
    value: number | null | undefined,
    fractionDigits = 2,
  ) => formatFraction((value ?? 0) / 100, fractionDigits);

  const formatDecimal = (value: number | null | undefined) =>
    new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value ?? 0);

  return {
    formatCurrency,
    formatFraction,
    formatPercentage,
    formatDecimal,
  };
};
