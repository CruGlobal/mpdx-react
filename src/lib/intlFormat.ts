import { DateTime } from 'luxon';

export const numberFormat = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, {
    style: 'decimal',
  }).format(Number.isFinite(value) ? value : 0);

export const percentageFormat = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
  }).format(Number.isFinite(value) ? value : 0);

// When we upgrade to Node 20 we can utilize this option for currencyFormat:
//trailingZeroDisplay: 'stripIfInteger',
export const currencyFormat = (
  value: number,
  currency: string | null | undefined,
  locale: string,
): string => {
  const amount = Number.isNaN(value) ? 0 : value;
  const decimal = amount % 1 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency ?? 'USD',
    minimumFractionDigits: decimal ? 2 : 0,
    maximumFractionDigits: decimal ? 2 : 0,
  }).format(Number.isFinite(amount) ? amount : 0);
};

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

export const dateFromParts = (
  year: number | null | undefined,
  month: number | null | undefined,
  day: number | null | undefined,
  locale: string,
): string | null => {
  if (typeof month !== 'number' || typeof day !== 'number') {
    return null;
  }

  if (typeof year === 'number') {
    return dateFormat(DateTime.local(year, month, day), locale);
  } else {
    return dayMonthFormat(day, month, locale);
  }
};

export const dateTimeFormat = (
  date: DateTime | null,
  locale: string,
): string => {
  if (date === null) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  }).format(date.toJSDate());
};

const intlFormat = {
  numberFormat,
  percentageFormat,
  currencyFormat,
  dayMonthFormat,
};

export default intlFormat;
