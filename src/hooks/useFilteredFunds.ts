import { useMemo } from 'react';
import { TFunction } from 'react-i18next';
import { Funds } from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/MPGAReportEnum';
import {
  addCategoryRow,
  addCombinedSubcategoryRow,
  addRowPerSubcategory,
} from '../components/Reports/MPGAIncomeExpensesReport/Helper/filterFunds';
import { DataFields } from '../components/Reports/MPGAIncomeExpensesReport/mockData';

export function useFilteredFunds(
  funds: Funds[],
  selectedCategories: string[] | null,
  t: TFunction,
) {
  return useMemo(() => {
    const incomeData: DataFields[] = [];
    const expenseData: DataFields[] = [];

    funds.forEach((fund) => {
      const base = fund.fundType;
      fund.categories?.forEach((category) => {
        const baseId = `${base}-${category.category}`;
        const isSelected =
          selectedCategories === null ||
          selectedCategories.includes(category.category);

        if (category.subcategories?.length && !isSelected) {
          addRowPerSubcategory({
            baseId,
            category,
            t,
            incomeData,
            expenseData,
          });
        } else if (category.subcategories?.length) {
          addCombinedSubcategoryRow({
            baseId,
            category,
            t,
            incomeData,
            expenseData,
          });
        } else {
          addCategoryRow({ baseId, category, t, incomeData, expenseData });
        }
      });
    });

    return {
      incomeData,
      expenseData,
    };
  }, [funds, selectedCategories, t]);
}
