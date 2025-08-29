import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { monthYearFormat } from 'src/lib/intlFormat';

export const useGetLastTwelveMonths = (
  locale: string,
  fullYear: boolean,
): string[] => {
  return useMemo(() => {
    const startDate = DateTime.now();
    const result: string[] = [];

    for (let i = 0; i < 12; i++) {
      const date = startDate.minus({ months: i });
      result.push(monthYearFormat(date.month, date.year, locale, fullYear));
    }
    return result.reverse();
  }, [locale, fullYear]);
};
