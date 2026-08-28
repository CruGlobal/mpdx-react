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
  /** Null when SAA has no employee for the transaction's EMPLID. */
  personNumber?: string | null;
}

/** A person sharing the account, in HCM's order: the staff member reading the report, then their spouse. */
export interface HouseholdMember {
  personNumber: string;
  name: string;
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
  /** Whose row this is, or null where the policy keeps the household together. */
  personNumber: string | null;
  transactions: Transaction[];
}

interface FilterTransactionsParams {
  fund: Pick<Fund, 'fundType' | 'total' | 'categories'>;
  targetTime: DateTime;
  t: TFunction;
  filters?: Filters | null;
  tableType: ReportType;
  household?: HouseholdMember[];
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

/**
 * Whose row a transaction lands in, or null where the policy keeps the household together. Payroll
 * SAA could not attribute falls to the staff member reading the report: a couple share one account,
 * so the alternative is a row belonging to nobody.
 */
const personOf = (
  transaction: Transaction,
  policy: AggregationPolicy,
  household: HouseholdMember[],
): string | null => {
  const [reader] = household;

  return policy.perPerson && reader
    ? (transaction.personNumber ?? reader.personNumber)
    : null;
};

const buildBucketKey = (
  transaction: Transaction,
  policy: AggregationPolicy,
  personNumber: string | null,
): string => {
  const bucket = bucketOf(transaction, policy);
  const period =
    policy.period === AggregationPeriod.Month
      ? transaction.transactedAt.slice(0, 7)
      : transaction.transactedAt;

  return [transaction.fundType, bucket, period, personNumber]
    .filter((segment) => segment !== null)
    .join('|');
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
  household: HouseholdMember[],
  t: TFunction,
): (Transaction | GroupedTransaction)[] => {
  const [reader] = household;
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

    const personNumber = personOf(transaction, policy, household);
    const key = buildBucketKey(transaction, policy, personNumber);
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
        personNumber,
        transactions: [transaction],
      });
    }
  });

  // Naming a person is only worth the noise once the report holds someone besides the reader. A
  // single staff member's rows read the same as they always have.
  const namePeople = Array.from(buckets.values()).some(
    (bucket) =>
      bucket.personNumber !== null &&
      bucket.personNumber !== reader?.personNumber,
  );

  // A person number HCM does not list belongs to neither spouse, so the household cannot name it.
  const unknownName = t('Spouse');

  const grouped = Array.from(buckets, ([bucketKey, bucket]) => {
    const [first] = bucket.transactions;
    const isSpouse =
      bucket.personNumber !== null &&
      bucket.personNumber !== reader?.personNumber;
    const label =
      namePeople && bucket.personNumber !== null
        ? t('{{bucket}} ({{person}})', {
            bucket: bucket.label,
            person:
              household.find(
                (member) => member.personNumber === bucket.personNumber,
              )?.name ?? unknownName,
          })
        : bucket.label;

    return {
      rank: bucket.rollupRank,
      // The reader's own row, and any row the household shares, leads their spouse's.
      personRank: isSpouse ? 1 : 0,
      row: {
        ...first,
        id: `grouped-${bucketKey}`,
        amount: bucket.transactions.reduce(
          (sum, { amount }) => sum + amount,
          0,
        ),
        transactedAt: bucketDate(first.transactedAt, bucket.period),
        description: label,
        displayCategory: label,
        // Members of a shared bucket differ, so reporting the first one's subcategory would be a
        // lie. Only a bucket of one subcategory can name it.
        category: bucket.sharedCategory ?? first.category,
        subcategory: bucket.sharedCategory ? undefined : first.subcategory,
        personNumber: bucket.personNumber,
        groupedTransactions: bucket.transactions,
        bucketKey,
        period: bucket.period,
      },
    };
  });

  return [
    ...grouped,
    ...itemized.map((row) => ({
      rank: ITEMIZED_ROW_RANK,
      personRank: 0,
      row,
    })),
  ]
    .sort(
      (rowA, rowB) =>
        rowA.rank - rowB.rank ||
        rowB.row.transactedAt.localeCompare(rowA.row.transactedAt) ||
        rowA.personRank - rowB.personRank ||
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
  household,
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

  return groupTransactions(
    transactions,
    filters?.categories ?? null,
    household ?? [],
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

const transactionsInRange = (
  funds: Fund[],
  filters: Filters | null | undefined,
  targetTime: DateTime,
): UnlabeledTransaction[] => {
  const isInDateRange = createDateRangeFilter(filters, targetTime);

  return funds
    .flatMap((fund) => flattenFund(fund))
    .filter((transaction) =>
      isInDateRange(DateTime.fromISO(transaction.transactedAt)),
    );
};

const uniqueCategories = (transactions: UnlabeledTransaction[]): string[] =>
  sortCategories([
    ...new Set<string>(transactions.map(({ category }) => category)),
  ]);

/**
 * Get all available categories that have transactions in the specified date range
 * Used for populating category filter options.
 */
export const getAvailableCategories = (
  funds: Fund[],
  filters: Filters | null | undefined,
  targetTime: DateTime,
): string[] =>
  uniqueCategories(transactionsInRange(funds, filters, targetTime));

/**
 * The categories holding at least one transaction the rules actually combine.
 *
 * Derived from the data rather than declared per category, because the rules are keyed by
 * subcategory: Staff Expense combines only the healthcare debit card, and Donation only donations
 * proper. Where the sheet requires individual rows there is nothing to combine, so offering a
 * checkbox would be a control that does nothing.
 */
export const getCombinableCategories = (
  funds: Fund[],
  filters: Filters | null | undefined,
  targetTime: DateTime,
): string[] =>
  uniqueCategories(
    transactionsInRange(funds, filters, targetTime).filter(
      ({ subcategory }) =>
        getAggregationPolicy(subcategory).period !== AggregationPeriod.None,
    ),
  );
