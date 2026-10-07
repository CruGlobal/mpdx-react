import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMonthlySummaryChartData } from '../Charts/MonthlySummaryChart/useMonthlySummaryChartData';
import { average } from '../Helper/filterFunds';
import { useMPGAIncomeExpenses } from '../MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { DataFields } from '../mockData';

export const useBalanceTableData = (): DataFields[] => {
  const { t } = useTranslation();
  const { startBalance, monthLabels, isFutureMonth } = useMPGAIncomeExpenses();
  const monthlyNet = useMonthlySummaryChartData();

  return useMemo(() => {
    if (startBalance === null) {
      return [];
    }

    const ending: number[] = [];

    let balance = startBalance;
    monthLabels.forEach((_month, index) => {
      if (isFutureMonth(index)) {
        return;
      }
      balance += monthlyNet[index]?.net ?? 0;
      ending.push(balance);
    });

    return [
      {
        id: 'ending-balance',
        description: t('Ending Balance'),
        monthly: ending,
        average: average(ending),
        total: 0,
      },
    ];
  }, [startBalance, monthLabels, isFutureMonth, monthlyNet, t]);
};
