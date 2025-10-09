import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { Filters } from 'src/components/Reports/StaffExpenseReport/SettingsDialog/SettingsDialog';
import { Transaction } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import { Fund } from 'src/graphql/types.generated';
import { ReportType } from './Helpers/StaffReportEnum';
import { getLocalizedCategory } from './Helpers/useLocalizedCategory';

interface FilterTransactionsParams {
  fund: Pick<Fund, 'fundType' | 'total' | 'categories'>;
  targetTime: DateTime;
  t: TFunction;
  filters?: Filters | null;
  tableType: ReportType;
}

export const filterTransactions = ({
  fund,
  targetTime,
  t,
  filters,
  tableType,
}: FilterTransactionsParams): Transaction[] => {
  const isInDateRange = createDateRangeFilter(filters, targetTime);

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

  return transactions.filter((transaction) =>
    tableType === ReportType.Income
      ? transaction.amount > 0
      : transaction.amount < 0,
  );
};

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
