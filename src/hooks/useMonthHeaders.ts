import { useCallback, useMemo } from 'react';
import { getMonthCount } from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/getMonthCount';
import { getMonthInfo } from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/getMonthInfo';

export const useMonthHeaders = (
  months: string[],
  colors: { first: string; second: string },
) => {
  const monthCount = useMemo(() => {
    return getMonthCount(months);
  }, [months]);

  const firstMonth = useMemo(() => getMonthInfo(months), [months]);

  const getBorderColor = useCallback(
    (index: number) => {
      return index === 0 ? colors.first : colors.second;
    },
    [firstMonth, colors, months],
  );

  return {
    monthCount,
    firstMonth,
    getBorderColor,
  };
};
