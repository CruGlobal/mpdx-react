import { DateTime } from 'luxon';

const getLanguage = (): string => {
  const language =
    (typeof window !== 'undefined' && window.navigator.language) || 'en-US';
  return language;
};

export const numberFormat = (value: number, language = getLanguage()): string =>
  new Intl.NumberFormat(language, {
    style: 'decimal',
  }).format(Number.isFinite(value) ? value : 0);

export const percentageFormat = (
  value: number,
  language = getLanguage(),
): string =>
  new Intl.NumberFormat(language, {
    style: 'percent',
  }).format(Number.isFinite(value) ? value : 0);

export const currencyFormat = (
  value: number,
  currency: string,
  minimumFractionDigits = 0,
  language = getLanguage(),
): string =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency ?? 'USD',
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
  }).format(new Date(new Date().getFullYear(), month, day));

export const monthYearFormat = (
  month: number,
  year: number,
  language = getLanguage(),
): string =>
  new Intl.DateTimeFormat(language, {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month, 1));

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
