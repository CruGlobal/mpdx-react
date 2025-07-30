import { DateTime } from 'luxon';
import { Filters } from 'src/components/Reports/StaffExpenseReport/SettingsDialog/SettingsDialog';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import { BreakdownByMonth, Fund } from 'src/graphql/types.generated';

export const filterTransactions = (
  fund: Fund,
  targetTime: DateTime,
  filters?: Filters | null,
): Transaction[] => {
  // Create a date range filter based on the provided filters or default to the target time
  const isInRange = createDateRangeFilter(filters, targetTime);

  return (
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
                  `${category.category} - ${subcategory.subCategory}`,
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
            ),
          ) ?? []
      );
    }) ?? []
  );
};

const mapTransactionToCategory = (
  transaction: BreakdownByMonth,
  fundType: Fund['fundType'],
  category: string,
): Transaction => ({
  ...transaction,
  fundType,
  category,
});

const createDateRangeFilter = (
  filters: Filters | null | undefined,
  targetTime: DateTime<boolean>,
) => {
  return (transactionDate: DateTime) => {
    if (filters && (filters.startDate || filters.endDate)) {
      return (
        (!filters.startDate || transactionDate >= filters.startDate) &&
        (filters.endDate
          ? transactionDate <= filters.endDate
          : transactionDate <= DateTime.now())
      );
    }
    return (
      transactionDate >= targetTime.startOf('month') &&
      transactionDate <= targetTime.endOf('month')
    );
  };
};
