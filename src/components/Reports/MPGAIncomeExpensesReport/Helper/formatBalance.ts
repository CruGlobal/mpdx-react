import { amountFormat } from 'src/lib/intlFormat';

// Balance rows need to show $0 balance as a true value
export const formatBalance = (
  value: number | null | undefined,
  locale: string,
): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (value === 0) {
    return new Intl.NumberFormat(locale).format(0);
  }
  return amountFormat(value, locale);
};
