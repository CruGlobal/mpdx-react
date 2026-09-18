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

    const starting: number[] = [];

    let balance = startBalance;
    monthLabels.forEach((_month, index) => {
      if (isFutureMonth(index)) {
        return;
      }
      starting.push(balance);
      balance += monthlyNet[index]?.net ?? 0;
    });

    return [
      {
        id: 'starting-balance',
        description: t('Starting Balance'),
        monthly: starting,
        average: average(starting),
        total: 0,
      },
    ];
  }, [startBalance, monthLabels, isFutureMonth, monthlyNet, t]);
};
