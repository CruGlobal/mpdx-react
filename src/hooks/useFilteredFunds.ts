import { useMemo } from 'react';
import { TFunction } from 'react-i18next';
import { Funds } from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/MPGAReportEnum';
import { DataFields } from '../components/Reports/MPGAIncomeExpensesReport/mockData';
import {
  getLocalizedCategory,
  getLocalizedSubCategory,
} from '../components/Reports/Shared/Helpers/transformStaffExpenseEnums';

const average = (data: number[]) => {
  const total = data.reduce((acc, item) => acc + item, 0);
  return total / data.length || 0;
};

const sum = (data: number[]) => {
  return data.reduce((acc, item) => acc + item, 0);
};

export function useFilteredFunds(
  funds: Funds[],
  selectedCategories: string[] | null,
  t: TFunction,
) {
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

    funds.forEach((fund) => {
      const base = fund.fundType;
      fund.categories?.forEach((category) => {
        const baseId = `${base}-${category.category}`;
        const isSelected =
          selectedCategories === null ||
          selectedCategories.includes(category.category);

        if (category.subcategories?.length && !isSelected) {
          // Unchecked category with subcategories: one row per subcategory
          const categoryName = getLocalizedCategory(category.category, t);
          category.subcategories.forEach((subcategory) => {
            const subcategoryName = getLocalizedSubCategory(
              subcategory.subCategory,
              t,
            );
            const id = `${baseId}-${subcategory.subCategory}`;
            const description =
              categoryName === subcategoryName
                ? categoryName
                : `${categoryName} - ${subcategoryName}`;
            const monthly = subcategory.breakdownByMonth.map((month) =>
              Number(month.total.toFixed(2)),
            );
            pushData({
              id,
              description,
              monthly,
              average: subcategory.averagePerMonth,
              total: subcategory.total,
            });
          });
        } else if (category.subcategories?.length) {
          // Checked category with subcategories: combine its subcategories into one row
          const monthCount = category.breakdownByMonth.length;
          const incomeMonthly = new Array(monthCount).fill(0);
          const expenseMonthly = new Array(monthCount).fill(0);

          category.subcategories.forEach((subcategory) => {
            subcategory.breakdownByMonth.forEach((month, index) => {
              const value = Number((month.total ?? 0).toFixed(2));
              if (value >= 0) {
                incomeMonthly[index] += value;
              } else {
                expenseMonthly[index] += value;
              }
            });
          });

          if (incomeMonthly.some((amount) => amount !== 0)) {
            pushData({
              id: `${baseId}-income`,
              description: getLocalizedCategory(category.category, t),
              monthly: incomeMonthly,
              average: average(incomeMonthly),
              total: sum(incomeMonthly),
            });
          }
          if (expenseMonthly.some((amount) => amount !== 0)) {
            pushData({
              id: `${baseId}-expense`,
              description: getLocalizedCategory(category.category, t),
              monthly: expenseMonthly,
              average: average(expenseMonthly),
              total: sum(expenseMonthly),
            });
          }
        } else {
          // Checked or unchecked category with no subcategories: use the category-level rollup
          const monthly = category.breakdownByMonth.map((month) =>
            Number(month.total.toFixed(2)),
          );
          pushData({
            id: baseId,
            description: getLocalizedCategory(category.category, t),
            monthly,
            average: category.averagePerMonth,
            total: category.total,
          });
        }
      });
    });

    return {
      incomeData,
      expenseData,
    };
  }, [funds, selectedCategories, t]);
}
