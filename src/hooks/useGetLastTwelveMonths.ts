import { useMemo } from 'react';
import { monthYearFormat } from 'src/lib/intlFormat';

export const useGetLastTwelveMonths = (
  locale: string,
  fullYear: boolean,
): string[] => {
  return useMemo(() => {
    const startDate = new Date();
    const result: string[] = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() - i,
        1,
      );
      result.push(
        monthYearFormat(
          date.getMonth() + 1,
          date.getFullYear(),
          locale,
          fullYear,
        ),
      );
    }
    return result.reverse();
  }, [locale, fullYear]);
};
