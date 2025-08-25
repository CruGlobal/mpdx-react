import { DateTime } from 'luxon';

export const numberFormat = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, {
    style: 'decimal',
  }).format(Number.isFinite(value) ? value : 0);

export const percentageFormat = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
  }).format(Number.isFinite(value) ? value : 0);

interface CurrencyFormatOptions {
  showTrailingZeros?: boolean;
}

export const currencyFormat = (
  value: number,
  currency: string | null | undefined,
  locale: string,
  options?: CurrencyFormatOptions,
): string => {
  const { showTrailingZeros = false } = options ?? {};

  const amount = Number.isNaN(value) ? 0 : value;
  if (!currency) {
    currency = 'USD';
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      trailingZeroDisplay: showTrailingZeros ? undefined : 'stripIfInteger',
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error formatting currency: ${error}`);
    return `${amount} ${currency}`;
  }
};

export const amountFormat = (
  value: number | undefined | null,
  locale: string,
): string => {
  if (!value) {
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      trailingZeroDisplay: 'stripIfInteger',
    }).format(Number.isFinite(value) ? value : 0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error formatting amount: ${error}`);
    return value.toString();
  }
};

export const zeroAmountFormat = (
  value: number | undefined | null,
  locale: string,
): string => {
  if (value === 0) {
    return '-';
  }
  return amountFormat(value, locale);
};

export const parseNumberFromCurrencyString = (
  input: string | null | undefined,
  locale: string = 'en-US',
): number | null => {
  if (!input) {
    return null;
  }

  // Use Intl.NumberFormat to determine group and decimal separators for the locale
  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
  const group =
    parts.find((part) => {
      return part.type === 'group';
    })?.value || ',';
  const decimal =
    parts.find((part) => {
      return part.type === 'decimal';
    })?.value || '.';

  let sanitized = input.trim().replace(/\s/g, '');

  // Remove group separators
  const groupRegex = new RegExp(`\\${group}`, 'g');
  sanitized = sanitized.replace(groupRegex, '');

  // Replace locale-specific decimal with `.`
  if (decimal !== '.') {
    const decimalRegex = new RegExp(`\\${decimal}`, 'g');
    sanitized = sanitized.replace(decimalRegex, '.');
  }

  const result = parseFloat(sanitized);
  return isNaN(result) ? null : result;
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
  fullYear = true,
): string =>
  new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: fullYear ? 'numeric' : '2-digit',
  }).format(DateTime.local(year, month, 1).toJSDate());

interface DateFormatOptions {
  fullMonth?: boolean;
}

export const dateFormat = (
  date: DateTime | null,
  locale: string,
  options?: DateFormatOptions,
): string => {
  const { fullMonth } = options ?? {};
  if (date === null) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: fullMonth ? 'long' : 'short',
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

export const dateFormatMonthOnly = (
  date: DateTime | null,
  locale: string,
): string => {
  if (date === null) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
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

  const date = validateAndFormatInvalidDate(year, month, day, locale);
  if (date.dateTime.invalidExplanation) {
    if (date.formattedInvalidDate) {
      return `${date.formattedInvalidDate} - Invalid Date, please fix.`;
    } else {
      return `Invalid Date - ${date.dateTime.invalidExplanation}`;
    }
  }
  if (typeof year === 'number') {
    return dateFormat(date.dateTime, locale);
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

export const validateAndFormatInvalidDate = (
  year: number | null | undefined,
  month: number,
  day: number,
  locale: string,
) => {
  const yyyy = year ?? DateTime.local().year;
  const date = DateTime.local(yyyy, month, day);
  let formattedInvalidDate = '';
  if (date.invalidExplanation && month === 0 && day === 0) {
    const placeholderYear = 2024;
    const placeholderMonth = 8;
    const placeholderDay = 15;
    const placeholderDate = new Date(
      placeholderYear,
      placeholderMonth - 1,
      placeholderDay,
    );
    const formattedPlaceholderDate = dateFormatShort(
      DateTime.fromISO(placeholderDate.toISOString()),
      locale,
    );

    formattedInvalidDate = formattedPlaceholderDate
      .replace(`${placeholderYear}`, `${yyyy}`)
      .replace(`${placeholderMonth}`, `${month}`)
      .replace(`${placeholderDay}`, `${day}`);
  }

  return {
    formattedInvalidDate,
    dateTime: date,
  };
};

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const UNITS = [
  { threshold: 365 * DAY_MS, name: 'year' as const },
  { threshold: 30 * DAY_MS, name: 'month' as const },
  { threshold: DAY_MS, name: 'day' as const },
  { threshold: HOUR_MS, name: 'hour' as const },
  { threshold: MINUTE_MS, name: 'minute' as const },
  { threshold: SECOND_MS, name: 'second' as const },
];

export const formatRelativeTime = (
  milliseconds: number,
  locale: string,
): string => {
  const unit =
    UNITS.find((unit) => Math.abs(milliseconds) >= unit.threshold) ??
    UNITS[UNITS.length - 1];
  const count = Math.round(milliseconds / unit.threshold);

  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
    count,
    unit.name,
  );
};
const intlFormat = {
  numberFormat,
  percentageFormat,
  currencyFormat,
  dayMonthFormat,
};

export default intlFormat;
