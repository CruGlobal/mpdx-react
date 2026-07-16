import { useMemo } from 'react';
import { TFunction } from 'react-i18next';
import { Funds } from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/MPGAReportEnum';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import {
  addCategoryRow,
  addCombinedSubcategoryRow,
  addRowPerSubcategory,
} from '../components/Reports/MPGAIncomeExpensesReport/Helper/filterFunds';
import {
  expenseCategoryRank,
  incomeCategoryRank,
} from '../components/Reports/MPGAIncomeExpensesReport/Helper/sortFunds';
import {
  CategoryBreakdown,
  DataFields,
} from '../components/Reports/MPGAIncomeExpensesReport/mockData';

export function useFilteredFunds(
  funds: Funds[],
  selectedCategories: string[] | null,
  t: TFunction,
) {
  return useMemo(() => {
    const incomeData: DataFields[] = [];
    const expenseData: DataFields[] = [];

    const incomeBreakdown: Partial<
      Record<StaffExpenseCategoryEnum, CategoryBreakdown[]>
    > = {};
    const expenseBreakdown: Partial<
      Record<StaffExpenseCategoryEnum, CategoryBreakdown[]>
    > = {};

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
            incomeBreakdown,
            expenseBreakdown,
          });
        } else {
          addCategoryRow({ baseId, category, t, incomeData, expenseData });
        }
      });
    });

    incomeData.sort(
      (a, b) => incomeCategoryRank(a.category) - incomeCategoryRank(b.category),
    );
    expenseData.sort(
      (a, b) =>
        expenseCategoryRank(a.category) - expenseCategoryRank(b.category),
    );

    return {
      incomeData,
      expenseData,
      incomeBreakdown,
      expenseBreakdown,
    };
  }, [funds, selectedCategories, t]);
}
