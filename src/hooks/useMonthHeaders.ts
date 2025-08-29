import { useCallback, useMemo } from 'react';

export const useMonthHeaders = (
  months: string[],
  colors: { first: string; second: string },
) => {
  const { monthCount, firstMonthFlags } = useMemo(() => {
    const yearsObj: Record<string, number> = {};
    const firstMonthFlags: { year: string; isFirstOfYear: boolean }[] = [];

    months.forEach((monthYear, index) => {
      const year = monthYear.split(' ')[1];

      yearsObj[year] = (yearsObj[year] || 0) + 1;

      const prevYear = index > 0 ? months[index - 1].split(' ')[1] : null;
      const isFirstOfYear = index === 0 || year !== prevYear;
      firstMonthFlags.push({ year, isFirstOfYear });
    });

    const monthCount = Object.entries(yearsObj).map(([year, count]) => ({
      year,
      count,
    }));

    return { monthCount, firstMonthFlags };
  }, [months]);

  const getBorderColor = useCallback(
    (index: number) => {
      return index === 0 ? colors.first : colors.second;
    },
    [colors, months],
  );

  return {
    monthCount,
    firstMonthFlags,
    getBorderColor,
  };
};
