import { currencyFormat } from 'src/lib/intlFormat';

export const parseInput = (s: string) => {
  const cleaned = s.replace(/[^\d.-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') {
    return undefined;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
};

export const display = (
  isEditing: (name: string) => boolean,
  name: string,
  value: string,
  currency: string,
  locale: string,
) => {
  return isEditing(name)
    ? value
      ? String(value)
      : ''
    : value
      ? currencyFormat(Number(value), currency, locale, {
          showTrailingZeros: true,
        })
      : '';
};
