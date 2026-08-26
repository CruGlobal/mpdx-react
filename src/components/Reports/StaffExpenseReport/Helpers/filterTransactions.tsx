import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { Filters } from 'src/components/Reports/Shared/SettingsDialog/SettingsDialog';
import {
  Fund,
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import {
  getLocalizedCategory,
  getLocalizedSubCategory,
} from '../../Shared/Helpers/transformStaffExpenseEnums';
import { transformTransactionDate } from '../../Shared/Helpers/transformTransactionDate';
import { ReportType } from './StaffReportEnum';
import {
  AggregationPeriod,
  AggregationPolicy,
  ITEMIZED_ROW_RANK,
  getAggregationPolicy,
  getBucketLabel,
  getRollupRank,
} from './aggregationPolicy';

export interface Transaction {
  id: string;
  amount: number;
  transactedAt: string;
  description?: string | null;
  fundType: string;
  category: StaffExpenseCategoryEnum;
  subcategory?: StaffExpensesSubCategoryEnum;
  displayCategory: string;
}

export interface GroupedTransaction extends Transaction {
  groupedTransactions: Transaction[];
  bucketKey: string;
  period: AggregationPeriod;
}

interface Bucket {
  label: string;
  period: AggregationPeriod;
  /** Set when several subcategories collapse together, in which case no one of them names the row. */
  sharedCategory?: StaffExpenseCategoryEnum;
  /** Where the finished row sorts among the rollups leading its section. */
  rollupRank: number;
  transactions: Transaction[];
}

interface FilterTransactionsParams {
  fund: Pick<Fund, 'fundType' | 'total' | 'categories'>;
  targetTime: DateTime;
  t: TFunction;
  filters?: Filters | null;
  tableType: ReportType;
}

/** A transaction before it gets a localized label. */
type UnlabeledTransaction = Omit<Transaction, 'displayCategory'>;

export const isGroupedTransaction = (
  transaction: Transaction | GroupedTransaction,
): transaction is GroupedTransaction => 'groupedTransactions' in transaction;

const flattenFund = (
  fund: Pick<Fund, 'fundType' | 'categories'>,
): UnlabeledTransaction[] =>
  fund.categories?.flatMap((category) =>
    category.subcategories.flatMap(
      (subcategory) =>
        subcategory.breakdownByMonth?.flatMap(
          (breakdown) =>
            breakdown.transactions?.map((transaction) => ({
              ...transaction,
              transactedAt: transformTransactionDate(transaction.transactedAt),
              fundType: fund.fundType,
              category: category.category,
              subcategory: subcategory.subCategory,
            })) ?? [],
        ) ?? [],
    ),
  ) ?? [];

const withDisplayCategory = (
  transaction: UnlabeledTransaction,
  t: TFunction,
): Transaction => {
  const category = getLocalizedCategory(transaction.category, t);
  const subCategory = transaction.subcategory
    ? getLocalizedSubCategory(transaction.subcategory, t)
    : category;

  return {
    ...transaction,
    displayCategory:
      category === subCategory ? category : `${category} - ${subCategory}`,
  };
};

/**
 * Whatever is being grouped: the category a policy names, or failing that the transaction's own
 * subcategory.
 */
const bucketOf = (transaction: Transaction, policy: AggregationPolicy) =>
  policy.bucket ?? transaction.subcategory ?? transaction.category;

const buildBucketKey = (
  transaction: Transaction,
  policy: AggregationPolicy,
): string => {
  const bucket = bucketOf(transaction, policy);
  const period =
    policy.period === AggregationPeriod.Month
      ? transaction.transactedAt.slice(0, 7)
      : transaction.transactedAt;

  return `${transaction.fundType}|${bucket}|${period}`;
};

/** The date a rolled up row is filed under: its shared day, or the 1st for a monthly bucket. */
const bucketDate = (transactedAt: string, period: AggregationPeriod): string =>
  period === AggregationPeriod.Month
    ? `${transactedAt.slice(0, 7)}-01`
    : transactedAt;

/**
 * Collapses transactions into rows following the aggregation policy. `consolidatedCategories` lists
 * the categories the reader left checked in Report Settings. Anything outside it is itemized.
 * `null` means untouched, so every category follows its own rule. The rolled up rows lead, in the
 * order staff read them, and the rest follow newest first.
 */
const groupTransactions = (
  transactions: Transaction[],
  consolidatedCategories: string[] | null,
  t: TFunction,
): (Transaction | GroupedTransaction)[] => {
  const buckets = new Map<string, Bucket>();
  const itemized: Transaction[] = [];

  transactions.forEach((transaction) => {
    const isConsolidated =
      consolidatedCategories === null ||
      consolidatedCategories.includes(transaction.category);
    const policy = isConsolidated
      ? getAggregationPolicy(transaction.subcategory)
      : { period: AggregationPeriod.None };

    if (policy.period === AggregationPeriod.None) {
      itemized.push(transaction);
      return;
    }

    const key = buildBucketKey(transaction, policy);
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.transactions.push(transaction);
    } else {
      buckets.set(key, {
        label: getBucketLabel(
          policy,
          transaction.category,
          transaction.subcategory,
          t,
        ),
        period: policy.period,
        sharedCategory: policy.bucket,
        rollupRank: getRollupRank(bucketOf(transaction, policy)),
        transactions: [transaction],
      });
    }
  });

  const grouped = Array.from(buckets, ([bucketKey, bucket]) => {
    const [first] = bucket.transactions;

    return {
      rank: bucket.rollupRank,
      row: {
        ...first,
        id: `grouped-${bucketKey}`,
        amount: bucket.transactions.reduce(
          (sum, { amount }) => sum + amount,
          0,
        ),
        transactedAt: bucketDate(first.transactedAt, bucket.period),
        description: bucket.label,
        displayCategory: bucket.label,
        // Members of a shared bucket differ, so reporting the first one's subcategory would be a
        // lie. Only a bucket of one subcategory can name it.
        category: bucket.sharedCategory ?? first.category,
        subcategory: bucket.sharedCategory ? undefined : first.subcategory,
        groupedTransactions: bucket.transactions,
        bucketKey,
        period: bucket.period,
      },
    };
  });

  return [
    ...grouped,
    ...itemized.map((row) => ({ rank: ITEMIZED_ROW_RANK, row })),
  ]
    .sort(
      (rowA, rowB) =>
        rowA.rank - rowB.rank ||
        rowB.row.transactedAt.localeCompare(rowA.row.transactedAt) ||
        rowA.row.displayCategory.localeCompare(rowB.row.displayCategory),
    )
    .map(({ row }) => row);
};

/** Filters a fund's transactions to one table and date range, then groups what remains. */
export const filterTransactions = ({
  fund,
  targetTime,
  t,
  filters,
  tableType,
}: FilterTransactionsParams): (Transaction | GroupedTransaction)[] => {
  const isInDateRange = createDateRangeFilter(filters, targetTime);
  const belongsInTable = (amount: number) =>
    tableType === ReportType.Income ? amount > 0 : amount < 0;

  const transactions = flattenFund(fund)
    .filter(
      (transaction) =>
        belongsInTable(transaction.amount) &&
        isInDateRange(DateTime.fromISO(transaction.transactedAt)),
    )
    .map((transaction) => withDisplayCategory(transaction, t));

  return groupTransactions(transactions, filters?.categories ?? null, t);
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
  return categories.sort((categoryA, categoryB) => {
    if (categoryA === StaffExpenseCategoryEnum.Other) {
      return 1;
    }
    if (categoryB === StaffExpenseCategoryEnum.Other) {
      return -1;
    }
    return categoryA.localeCompare(categoryB);
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
              isInDateRange(
                DateTime.fromISO(
                  transformTransactionDate(transaction.transactedAt),
                ),
              ),
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
