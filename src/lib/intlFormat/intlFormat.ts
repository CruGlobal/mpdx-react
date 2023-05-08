import { DateTime } from 'luxon';

// Return the current locale's date format (i.e. patterns like MM/dd/yyyy, dd.MM.yyyy, yyyy.MM.dd)
export const getDateFormatPattern = (language: string): string =>
  new Intl.DateTimeFormat(language)
    // Use January 1st so that the month and day of month are both one-digit numbers
    .formatToParts(new Date(2023, 0, 1))
    .reduce((pattern, part) => {
      switch (part.type) {
        case 'day':
          return pattern + 'd'.repeat(part.value.length);
        case 'month':
          return pattern + 'M'.repeat(part.value.length);
        case 'year':
          return pattern + 'y'.repeat(part.value.length);
        case 'literal':
          return pattern + part.value;
        default:
          /* istanbul ignore next */
          return pattern;
      }
    }, '');

export const numberFormat = (value: number, language: string): string =>
  new Intl.NumberFormat(language, {
    style: 'decimal',
  }).format(Number.isFinite(value) ? value : 0);

export const percentageFormat = (value: number, language: string): string =>
  new Intl.NumberFormat(language, {
    style: 'percent',
  }).format(Number.isFinite(value) ? value : 0);

export const currencyFormat = (
  value: number,
  currency: string | null | undefined,
  language: string,
): string =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency ?? 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const dayMonthFormat = (
  day: number,
  month: number,
  language: string,
): string =>
  new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
  }).format(DateTime.local().set({ month, day }).toJSDate());

export const monthYearFormat = (
  month: number,
  year: number,
  language: string,
): string =>
  new Intl.DateTimeFormat(language, {
    month: 'short',
    year: 'numeric',
  }).format(DateTime.local(year, month, 1).toJSDate());

export const dateFormat = (date: DateTime | null, language: string): string => {
  if (date === null) {
    return '';
  }
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date.toJSDate());
};

const intlFormat = {
  numberFormat,
  percentageFormat,
  currencyFormat,
  dayMonthFormat,
};

export default intlFormat;
