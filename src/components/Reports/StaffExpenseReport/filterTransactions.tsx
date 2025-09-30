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

  // If no categories to group by, return filtered transactions
  if (!filters?.categories || filters.categories.length === 0) {
    return filteredTransactions;
  }

  // Group transactions by filter categories
  return groupTransactionsByCategories(
    filteredTransactions,
    filters.categories,
    t,
  );
};

const groupTransactionsByCategories = (
  transactions: Transaction[],
  categoriesToGroup: StaffExpenseCategoryEnum[],
  t: TFunction,
): Transaction[] => {
  const grouped: Record<string, Transaction[]> = {};
  const ungrouped: Transaction[] = [];

  // Separate transactions into grouped and ungrouped
  transactions.forEach((transaction) => {
    if (categoriesToGroup.includes(transaction.category)) {
      const categoryKey = transaction.category;
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = [];
      }
      grouped[categoryKey].push(transaction);
    } else {
      ungrouped.push(transaction);
    }
  });

  // Create aggregated transactions for each grouped category
  const aggregatedTransactions: Transaction[] = Object.entries(grouped).map(
    ([categoryKey, categoryTransactions]) => {
      const totalAmount = categoryTransactions.reduce(
        (sum, transaction) => sum + transaction.total,
        0,
      );

      const firstTransaction = categoryTransactions[0];
      return {
        ...firstTransaction,
        total: totalAmount,
        displayCategory: getReadableCategory(
          categoryKey as StaffExpenseCategoryEnum,
          t,
        ),
        // Keep the month from the first transaction for date display
        month: firstTransaction.month,
        subTransactions: categoryTransactions,
      };
    },
  );

  // Return aggregated transactions plus ungrouped ones
  return [...aggregatedTransactions, ...ungrouped];
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
