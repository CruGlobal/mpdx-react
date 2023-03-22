import { DateTime } from 'luxon';

const getLanguage = (): string => {
  const language =
    (typeof window !== 'undefined' && window.navigator.language) || 'en-US';
  return language;
};

// Return the current locale's date format (i.e. patterns like MM/dd/yyyy, dd.MM.yyyy, yyyy.MM.dd)
export const getDateFormatPattern = (language = getLanguage()): string =>
  new Intl.DateTimeFormat(language).formatToParts().reduce((pattern, part) => {
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

export const numberFormat = (value: number, language = getLanguage()): string =>
  new Intl.NumberFormat(language, {
    style: 'decimal',
  }).format(Number.isFinite(value) ? value : 0);

export const percentageFormat = (
  value: number,
  language = getLanguage(),
  removeSpace = false,
): string => {
  const percentage = new Intl.NumberFormat(language, {
    style: 'percent',
  }).format(Number.isFinite(value) ? value : 0);
  return removeSpace ? percentage?.replace(' ', '') : percentage;
};

export const currencyFormat = (
  value: number,
  currency = 'USD',
  minimumFractionDigits = 0,
  language = getLanguage(),
): string =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
    minimumFractionDigits,
  }).format(
    Number.isFinite(value)
      ? parseFloat(value.toFixed(minimumFractionDigits))
      : 0,
  );

export const dayMonthFormat = (
  day: number,
  month: number,
  language = getLanguage(),
): string =>
  new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
  }).format(DateTime.local().set({ month, day }).toJSDate());

export const monthYearFormat = (
  month: number,
  year: number,
  language = getLanguage(),
): string =>
  new Intl.DateTimeFormat(language, {
    month: 'short',
    year: 'numeric',
  }).format(DateTime.local(year, month, 1).toJSDate());

export const dateFormat = (
  date: DateTime,
  language = getLanguage(),
): string => {
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
