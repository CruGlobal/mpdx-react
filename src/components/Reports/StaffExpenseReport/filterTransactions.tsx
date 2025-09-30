import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { Filters } from 'src/components/Reports/StaffExpenseReport/SettingsDialog/SettingsDialog';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import {
  BreakdownByMonth,
  Fund,
  StaffExpenseCategoryEnum,
} from 'src/graphql/types.generated';
import { getReadableCategory } from './Helpers/useReadableCategories';

export const filterTransactions = (
  fund: Pick<Fund, 'fundType' | 'total' | 'categories'>,
  targetTime: DateTime,
  t: TFunction,
  filters?: Filters | null,
  tableType?: 'income' | 'expenses',
): Transaction[] => {
  // Create a date range filter based on the provided filters or default to the target time
  const isInRange = createDateRangeFilter(filters, targetTime);

  const transactions =
    fund.categories?.flatMap((category) => {
      if (category.subcategories) {
        return category.subcategories.flatMap(
          (subcategory) =>
            subcategory.breakdownByMonth
              ?.filter((transaction) =>
                isInRange(DateTime.fromISO(transaction.month)),
              )
              .map((transaction) =>
                mapTransactionToCategory(
                  transaction,
                  fund.fundType,
                  category.category,
                  `${getReadableCategory(
                    category.category,
                    t,
                  )} - ${getReadableCategory(subcategory.subCategory, t)}`,
                ),
              ) ?? [],
        );
      }
      return (
        category.breakdownByMonth
          ?.filter((transaction) =>
            isInRange(DateTime.fromISO(transaction.month)),
          )
          .map((transaction) =>
            mapTransactionToCategory(
              transaction,
              fund.fundType,
              category.category,
              getReadableCategory(category.category, t),
            ),
          ) ?? []
      );
    }) ?? [];

  // Filter by positive/negative values BEFORE grouping if tableType is specified
  const filteredTransactions = tableType
    ? transactions.filter((transaction) =>
        tableType === 'income' ? transaction.total > 0 : transaction.total < 0,
      )
    : transactions;

  return filteredTransactions;
};

const mapTransactionToCategory = (
  transaction: BreakdownByMonth,
  fundType: Fund['fundType'],
  categoryEnum: StaffExpenseCategoryEnum,
  displayCategory: string,
): Transaction => ({
  ...transaction,
  fundType,
  category: categoryEnum,
  displayCategory,
});

const createDateRangeFilter = (
  filters: Filters | null | undefined,
  targetTime: DateTime<boolean>,
) => {
  return (transactionDate: DateTime) => {
    if (filters && (filters.startDate || filters.endDate)) {
      return (
        (!filters.startDate || transactionDate >= filters.startDate) &&
        (!filters.endDate || transactionDate <= filters.endDate)
      );
    }
    return (
      transactionDate >= targetTime.startOf('month') &&
      transactionDate <= targetTime.endOf('month')
    );
  };
};
