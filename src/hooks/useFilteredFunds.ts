import { useMemo } from 'react';
import { TFunction } from 'react-i18next';
import { Funds } from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/MPGAReportEnum';
import { HouseholdMember } from 'src/components/Reports/Shared/Helpers/household';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import {
  addCategoryRow,
  addCombinedSubcategoryRow,
  addRowPerSubcategory,
  buildUnknownKey,
} from '../components/Reports/MPGAIncomeExpensesReport/Helper/filterFunds';
import {
  expenseCategoryRank,
  incomeCategoryRank,
} from '../components/Reports/MPGAIncomeExpensesReport/Helper/sortFunds';
import { DataFields } from '../components/Reports/MPGAIncomeExpensesReport/mockData';

// A stable default so the memo below is not invalidated by a fresh array every render.
const noHousehold: HouseholdMember[] = [];

/**
 * `household` lists the people sharing the account, reader first. With a spouse present, the
 * combined Salary row splits into one row per person.
 */
export function useFilteredFunds(
  funds: Funds[],
  selectedCategories: string[] | null,
  t: TFunction,
  household: HouseholdMember[] = noHousehold,
) {
  return useMemo(() => {
    const incomeData: DataFields[] = [];
    const expenseData: DataFields[] = [];

    funds.forEach((fund) => {
      const base = fund.id;
      fund.categories?.forEach((category, index) => {
        const categoryKey = buildUnknownKey(
          category.category,
          StaffExpenseCategoryEnum.Unknown,
          index,
        );

        const baseId = `${base}-${categoryKey}`;
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
            household,
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
    };
  }, [funds, selectedCategories, t, household]);
}
