import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { monthYearFormat } from 'src/lib/intlFormat';

/**
 * Returns an ordered list of month labels.
 *
 * By default, it returns the last twelve months ending in the current
 * month. When "year" is provided, it instead returns January–December of that
 * calendar year.
 */
export const useGetLastTwelveMonths = (
  locale: string,
  year?: number | null,
): string[] => {
  return useMemo(() => {
    const result: string[] = [];

    if (year !== null && year !== undefined) {
      for (let month = 1; month <= 12; month++) {
        result.push(monthYearFormat(month, year, locale, true));
      }
      return result;
    }

    const startDate = DateTime.now();
    for (let i = 0; i < 12; i++) {
      const date = startDate.minus({ months: i });
      result.push(monthYearFormat(date.month, date.year, locale, true));
    }
    return result.reverse();
  }, [locale, year]);
};
