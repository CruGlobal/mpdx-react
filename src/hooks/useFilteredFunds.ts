import { useMemo } from 'react';
import { DataFields } from '../components/Reports/MPGAIncomeExpensesReport/mockData';

const average = (data: number[]) => {
  const total = data.reduce((acc, item) => acc + item, 0);
  return total / data.length || 0;
};

const sum = (data: number[]) => {
  return data.reduce((acc, item) => acc + item, 0);
};

export function useFilteredFunds(reportData) {
  return useMemo(() => {
    const incomeData: DataFields[] = [];
    const expenseData: DataFields[] = [];

    const pushData = (data: DataFields) => {
      const allPositive = data.monthly.every((month) => month >= 0);
      const allNegative = data.monthly.every((month) => month <= 0);

      if (allPositive) {
        incomeData.push({
          ...data,
          monthly: data.monthly.map((month) =>
            Number(Math.abs(month).toFixed(2)),
          ),
          average: Number(Math.abs(data.average).toFixed(2)),
          total: Number(Math.abs(data.total).toFixed(2)),
        });
        return;
      } else if (allNegative) {
        expenseData.push({
          ...data,
          monthly: data.monthly.map((month) =>
            Number(Math.abs(month).toFixed(2)),
          ),
          average: Number(Math.abs(data.average).toFixed(2)),
          total: Number(Math.abs(data.total).toFixed(2)),
        });
        return;
      }

      const incomeMonthly = data.monthly.map((month) =>
        month > 0 ? Number(month.toFixed(2)) : 0,
      );
      const expenseMonthly = data.monthly.map((month) =>
        month < 0 ? Number(Math.abs(month).toFixed(2)) : 0,
      );

      incomeData.push({
        ...data,
        monthly: incomeMonthly,
        average: average(incomeMonthly),
        total: sum(incomeMonthly),
      });
      expenseData.push({
        ...data,
        monthly: expenseMonthly,
        average: average(expenseMonthly),
        total: sum(expenseMonthly),
      });
    };

    reportData?.reportsStaffExpenses.funds.forEach((fund) => {
      const base = fund.fundType;
      fund.categories?.forEach((category) => {
        const baseId = `${base}-${category.category}`;
        if (category.subcategories?.length) {
          category.subcategories.forEach((subcategory) => {
            const id = `${baseId}-${subcategory.subCategory}`;
            const description =
              category.category === subcategory.subCategory
                ? category.category
                : `${category.category} - ${subcategory.subCategory}`;
            const monthly = subcategory.breakdownByMonth.map((month) =>
              Number(month.total.toFixed(2)),
            );
            const average = subcategory.averagePerMonth;
            const total = subcategory.total;
            pushData({
              id,
              description,
              monthly,
              average,
              total,
            });
          });
        } else {
          const id = baseId;
          const description = category.category;
          const monthly = category.breakdownByMonth.map((month) =>
            Number(month.total.toFixed(2)),
          );
          const average = category.averagePerMonth;
          const total = category.total;
          pushData({
            id,
            description,
            monthly,
            average,
            total,
          });
        }
      });
    });

    return {
      incomeData,
      expenseData,
    };
  }, [reportData]);
}
