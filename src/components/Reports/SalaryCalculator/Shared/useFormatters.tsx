import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';

export const useFormatters = () => {
  const locale = useLocale();

  const formatCurrency = (value: number | null | undefined) =>
    currencyFormat(value ?? 0, 'USD', locale, {
      fractionDigits: 2,
      showTrailingZeros: true,
    });

  const formatFraction = (value: number | null | undefined) =>
    percentageFormat(value ?? 0, locale, { fractionDigits: 2 });

  const formatPercentage = (value: number | null | undefined) =>
    formatFraction((value ?? 0) / 100);

  const formatDecimal = (value: number | null | undefined) =>
    new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);

  return {
    formatCurrency,
    formatFraction,
    formatPercentage,
    formatDecimal,
  };
};
