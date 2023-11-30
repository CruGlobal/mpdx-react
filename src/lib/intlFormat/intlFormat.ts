import { DateTime } from 'luxon';

// Return the current locale's date format (i.e. patterns like MM/dd/yyyy, dd.MM.yyyy, yyyy.MM.dd)
export const getDateFormatPattern = (locale: string): string =>
  new Intl.DateTimeFormat(locale)
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

export const numberFormat = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, {
    style: 'decimal',
  }).format(Number.isFinite(value) ? value : 0);

export const percentageFormat = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
  }).format(Number.isFinite(value) ? value : 0);

export const currencyFormat = (
  value: number,
  currency: string | null | undefined,
  locale: string,
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency ?? 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const dayMonthFormat = (
  day: number,
  month: number,
  locale: string,
): string =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(DateTime.local().set({ month, day }).toJSDate());

export const monthYearFormat = (
  month: number,
  year: number,
  locale: string,
): string =>
  new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
  }).format(DateTime.local(year, month, 1).toJSDate());

export const dateFormat = (date: DateTime | null, locale: string): string => {
  if (date === null) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date.toJSDate());
};

export const dateFormatShort = (date: DateTime, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date.toJSDate());

export const dateFormatWithoutYear = (
  date: DateTime | null,
  locale: string,
): string => {
  if (date === null) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(date.toJSDate());
};

const intlFormat = {
  numberFormat,
  percentageFormat,
  currencyFormat,
  dayMonthFormat,
};

export default intlFormat;
