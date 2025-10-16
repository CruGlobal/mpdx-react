import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { Filters } from 'src/components/Reports/StaffExpenseReport/SettingsDialog/SettingsDialog';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import { Fund, StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import { ReportType } from './StaffReportEnum';
import { getLocalizedCategory } from './useLocalizedCategory';

export interface GroupedTransaction extends Transaction {
  groupedTransactions: Transaction[];
  categoryName: string;
}

interface FilterTransactionsParams {
  fund: Pick<Fund, 'fundType' | 'total' | 'categories'>;
  targetTime: DateTime;
  t: TFunction;
  filters?: Filters | null;
  tableType: ReportType;
}

/**
 * Groups transactions by selected categories into consolidated GroupedTransaction objects
 */
const groupTransactionsByCategory = (
  transactions: Transaction[],
  selectedCategories: string[],
  fundType: string,
  t: TFunction,
): (Transaction | GroupedTransaction)[] => {
  // If no categories are selected for grouping, return all transactions
  if (selectedCategories.length === 0) {
    return transactions;
  }

  // Group transactions by category if the category is in selectedCategories
  const grouped: Map<string, Transaction[]> = new Map();
  const ungrouped: Transaction[] = [];

  transactions.forEach((transaction) => {
    if (selectedCategories.includes(transaction.category)) {
      const key = transaction.category;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(transaction);
    } else {
      ungrouped.push(transaction);
    }
  });

  // Create consolidated transactions for grouped categories
  // and sort grouped transactions alphabetically by category name for consistent ordering
  const consolidatedTransactions: GroupedTransaction[] = Array.from(
    grouped.entries(),
  )
    .sort(([catA], [catB]) => catA.localeCompare(catB))
    .map(([category, transactions]) => {
      const totalAmount = transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      );
      const earliestDate = transactions.reduce(
        (earliest, transaction) =>
          transaction.transactedAt < earliest
            ? transaction.transactedAt
            : earliest,
        transactions[0].transactedAt,
      );

      return {
        id: `grouped-${category}`,
        amount: totalAmount,
        transactedAt: earliestDate,
        description: t('Grouped Transactions'),
        fundType,
        category: transactions[0].category,
        subcategory: transactions[0].subcategory,
        displayCategory: getLocalizedCategory(transactions[0].category, t),
        groupedTransactions: transactions,
        categoryName: category,
      };
    });

  return [...consolidatedTransactions, ...ungrouped];
};

/**
 * Filters transactions by date range and type (income/expense), optionally grouping selected categories
 */
export const filterTransactions = ({
  fund,
  targetTime,
  t,
  filters,
  tableType,
}: FilterTransactionsParams): (Transaction | GroupedTransaction)[] => {
  const isInDateRange = createDateRangeFilter(filters, targetTime);
  const selectedCategories = filters?.categories ?? [];

  const transactions =
    fund.categories?.flatMap((category) =>
      category.subcategories.flatMap((subcategory) =>
        subcategory.breakdownByMonth?.flatMap(
          (breakdown) =>
            breakdown.transactions
              ?.filter((transaction) =>
                isInDateRange(DateTime.fromISO(transaction.transactedAt)),
              )
              .map((transaction) => ({
                ...transaction,
                fundType: fund.fundType,
                category: category.category,
                subcategory: subcategory.subCategory,
                displayCategory: `${getLocalizedCategory(
                  category.category,
                  t,
                )} - ${getLocalizedCategory(subcategory.subCategory, t)}`,
              })) ?? [],
        ),
      ),
    ) ?? [];

  const filteredTransactions = transactions.filter((transaction) =>
    tableType === ReportType.Income
      ? transaction.amount > 0
      : transaction.amount < 0,
  );

  return groupTransactionsByCategory(
    filteredTransactions,
    selectedCategories,
    fund.fundType,
    t,
  );
};

/**
 * Creates a date range filter function based on provided filters or default target time
 */
export const createDateRangeFilter = (
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

/**
 * Sort categories alphabetically with "Other" always at the end
 */
export const sortCategories = (categories: string[]): string[] => {
  return categories.sort((a, b) => {
    if (a === StaffExpenseCategoryEnum.Other) {
      return 1;
    }
    if (b === StaffExpenseCategoryEnum.Other) {
      return -1;
    }
    return a.localeCompare(b);
  });
};

/**
 * Get all available categories that have transactions in the specified date range
 * Used for populating category filter options.
 */
export const getAvailableCategories = (
  funds: Fund[],
  filters: Filters | null | undefined,
  targetTime: DateTime,
): string[] => {
  const isInDateRange = createDateRangeFilter(filters, targetTime);

  const categoriesWithTransactions = new Set<string>();

  funds.forEach((fund) => {
    fund.categories?.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        subcategory.breakdownByMonth?.forEach((breakdown) => {
          const hasTransactionsInRange = breakdown.transactions?.some(
            (transaction) =>
              isInDateRange(DateTime.fromISO(transaction.transactedAt)),
          );
          if (hasTransactionsInRange) {
            categoriesWithTransactions.add(category.category);
          }
        });
      });
    });
  });

  return sortCategories(Array.from(categoriesWithTransactions));
};
