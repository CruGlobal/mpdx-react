import { currencyFormat } from 'src/lib/intlFormat';
import { CalculationFormValues } from '../../Calculation';

// Helper function to parse a currency input string into a number
export const parseInput = (s: string) => {
  const cleaned = s.replace(/[^\d.-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') {
    return undefined;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
};

export const display = (
  isEditing: (name: keyof CalculationFormValues & string) => boolean,
  name: keyof CalculationFormValues & string,
  value: number | undefined | null,
  currency: string,
  locale: string,
) => {
  return isEditing(name)
    ? value
      ? String(value)
      : ''
    : value
      ? currencyFormat(value as number, currency, locale, {
          showTrailingZeros: true,
        })
      : '';
};
