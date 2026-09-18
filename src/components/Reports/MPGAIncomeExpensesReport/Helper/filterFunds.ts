import { TFunction } from 'react-i18next';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { HouseholdMember } from '../../Shared/Helpers/household';
import {
  getLocalizedCategory,
  getLocalizedSubCategory,
  getPluralizedDescription,
} from '../../Shared/Helpers/transformStaffExpenseEnums';
import { DataFields, TransactionBreakdown } from '../mockData';
import { Categories } from './MPGAReportEnum';

export const buildUnknownKey = <T extends string>(
  value: T,
  unknownValue: T,
  index: number,
): string => (value === unknownValue ? `${value}-${index}` : value);

const average = (data: number[]) => {
  const total = data.reduce((acc, item) => acc + item, 0);
  return total / data.length || 0;
};

const sum = (data: number[]) => {
  return data.reduce((acc, item) => acc + item, 0);
};

const roundTwoDecimals = (value: number) => {
  return Number(value.toFixed(2));
};

// Separate income (positive) and expense (negative) values into two rows, or if all values are positive or negative, just one row
export function pushData(
  data: DataFields,
  incomeData: DataFields[],
  expenseData: DataFields[],
) {
  if (data.monthly.every((month) => month === 0)) {
    return;
  }

  const allPositive = data.monthly.every((month) => month >= 0);
  const allNegative = data.monthly.every((month) => month <= 0);

  if (allPositive || allNegative) {
    const target = allPositive ? incomeData : expenseData;
    target.push({
      ...data,
      monthly: data.monthly.map((month) => roundTwoDecimals(Math.abs(month))),
      average: roundTwoDecimals(Math.abs(data.average)),
      total: roundTwoDecimals(Math.abs(data.total)),
    });
    return;
  }

  const incomeMonthly = data.monthly.map((month) =>
    month > 0 ? roundTwoDecimals(month) : 0,
  );
  const expenseMonthly = data.monthly.map((month) =>
    month < 0 ? roundTwoDecimals(Math.abs(month)) : 0,
  );

  const pushSplit = (target: DataFields[], monthly: number[]) => {
    target.push({
      ...data,
      monthly,
      average: average(monthly),
      total: sum(monthly),
    });
  };

  pushSplit(incomeData, incomeMonthly);
  pushSplit(expenseData, expenseMonthly);
}

interface AddRowProps {
  baseId: string;
  category: Categories;
  t: TFunction;
  incomeData: DataFields[];
  expenseData: DataFields[];
}

// Unchecked category with subcategories: one row per subcategory
export function addRowPerSubcategory({
  baseId,
  category,
  t,
  incomeData,
  expenseData,
}: AddRowProps) {
  const categoryName = getLocalizedCategory(category.category, t);
  category.subcategories.forEach((subcategory, index) => {
    const subcategoryKey = buildUnknownKey(
      subcategory.subCategory,
      StaffExpensesSubCategoryEnum.Unknown,
      index,
    );

    const subcategoryName = getLocalizedSubCategory(subcategory.subCategory, t);
    const id = `${baseId}-${subcategoryKey}`;
    const description =
      categoryName === subcategoryName
        ? categoryName
        : `${categoryName} - ${subcategoryName}`;
    const monthly = subcategory.breakdownByMonth.map((month) =>
      roundTwoDecimals(month.total),
    );
    pushData(
      {
        id,
        description,
        category: category.category,
        monthly,
        average: subcategory.averagePerMonth,
        total: subcategory.total,
      },
      incomeData,
      expenseData,
    );
  });
}

interface AddCombinedRowProps extends AddRowProps {
  household?: HouseholdMember[];
}

/** One person's share of a combined category, split by sign into income and expense rows. */
interface PersonAccumulator {
  incomeMonthly: number[];
  expenseMonthly: number[];
  incomeTransactions: TransactionBreakdown[];
  expenseTransactions: TransactionBreakdown[];
}

/** One person's slice of a subcategory month. */
interface PersonMonth {
  /** Whose slice this is, or null where the household stays together. */
  personNumber: string | null;
  total: number;
  transactions: TransactionBreakdown[];
}

const createAccumulator = (monthCount: number): PersonAccumulator => ({
  incomeMonthly: new Array(monthCount).fill(0),
  expenseMonthly: new Array(monthCount).fill(0),
  incomeTransactions: [],
  expenseTransactions: [],
});

/**
 * Salary splits one row per person once a second person turns up, either listed by HCM or carried
 * on a payroll line. Until then the row is the API's month total, exactly as before splitting
 * existed. Benefits and everything else stay one household row.
 */
const splitsPerPerson = (
  category: Categories,
  household: HouseholdMember[],
): boolean => {
  const [reader, ...others] = household;
  if (category.category !== StaffExpenseCategoryEnum.Salary || !reader) {
    return false;
  }
  return (
    others.length > 0 ||
    category.subcategories.some((subcategory) =>
      subcategory.breakdownByMonth.some((month) =>
        month.transactions?.some(
          ({ personNumber }) =>
            personNumber && personNumber !== reader.personNumber,
        ),
      ),
    )
  );
};

/**
 * Divides a subcategory month between the people it paid, each summed from their own transactions
 * the way the Staff Expense report does. Payroll SAA could not attribute falls to the reader: a
 * couple share one account, so the alternative is a row belonging to nobody. The month total is
 * not consulted here; charging its rounding gap to anyone would invent a row for a person the
 * month never paid.
 */
const splitMonth = (
  transactions: {
    personNumber: string | null;
    breakdown: TransactionBreakdown;
  }[],
  reader: string,
): PersonMonth[] => {
  // The reader leads whoever else turns up, so their slice is seeded first.
  const slices = new Map<string, PersonMonth>([
    [reader, { personNumber: reader, total: 0, transactions: [] }],
  ]);

  transactions.forEach(({ personNumber, breakdown }) => {
    const owner = personNumber ?? reader;
    const slice = slices.get(owner) ?? {
      personNumber: owner,
      total: 0,
      transactions: [],
    };
    slice.total += breakdown.amount;
    slice.transactions.push(breakdown);
    slices.set(owner, slice);
  });

  return Array.from(slices.values(), (slice) => ({
    ...slice,
    total: roundTwoDecimals(slice.total),
  }));
};

// Checked category with subcategories: combine its subcategories into one row
export function addCombinedSubcategoryRow({
  baseId,
  category,
  t,
  incomeData,
  expenseData,
  household = [],
}: AddCombinedRowProps) {
  const monthCount = category.breakdownByMonth.length;
  const reader = splitsPerPerson(category, household)
    ? household[0].personNumber
    : null;

  // Insertion order is display order, so the reader's row leads whoever else turns up.
  const people = new Map<string | null, PersonAccumulator>();
  const accumulatorFor = (personNumber: string | null) => {
    const existing = people.get(personNumber);
    if (existing) {
      return existing;
    }
    const created = createAccumulator(monthCount);
    people.set(personNumber, created);
    return created;
  };
  accumulatorFor(reader);

  category.subcategories.forEach((subcategory) => {
    subcategory.breakdownByMonth.forEach((month, index) => {
      const monthTotal = roundTwoDecimals(month.total);
      const transactions = (month.transactions ?? []).map((transaction) => ({
        // A blank person number is as unattributed as a missing one.
        personNumber: transaction.personNumber || null,
        breakdown: {
          date: transaction.transactedAt,
          description: transaction.description ?? '',
          category: category.category,
          subCategory: subcategory.subCategory,
          amount: transaction.amount,
        },
      }));

      const slices: PersonMonth[] =
        reader === null
          ? [
              {
                personNumber: null,
                total: monthTotal,
                transactions: transactions.map(({ breakdown }) => breakdown),
              },
            ]
          : splitMonth(transactions, reader);

      slices.forEach((slice) => {
        const accumulator = accumulatorFor(slice.personNumber);
        const isIncome = slice.total >= 0;
        (isIncome ? accumulator.incomeMonthly : accumulator.expenseMonthly)[
          index
        ] += slice.total;
        (isIncome
          ? accumulator.incomeTransactions
          : accumulator.expenseTransactions
        ).push(...slice.transactions);
      });
    });
  });

  const categoryLabel =
    getPluralizedDescription(category.category, t) ||
    getLocalizedCategory(category.category, t);
  // Naming a person is only worth the noise once the report holds someone besides the reader.
  const namePeople = people.size > 1;
  // A person number HCM does not list belongs to neither spouse, so the household cannot name it.
  const unknownName = t('Spouse');

  people.forEach((accumulator, personNumber) => {
    const person =
      namePeople && personNumber !== null
        ? (household.find((member) => member.personNumber === personNumber)
            ?.name ?? unknownName)
        : undefined;
    const description = person
      ? t('{{bucket}} ({{person}})', { bucket: categoryLabel, person })
      : categoryLabel;
    const rowId = namePeople ? `${baseId}-${personNumber}` : baseId;

    const pushAggregateRow = (
      id: string,
      monthly: number[],
      transactions: TransactionBreakdown[],
    ) => {
      pushData(
        {
          id,
          description,
          category: category.category,
          person,
          transactions,
          monthly,
          average: average(monthly),
          total: sum(monthly),
        },
        incomeData,
        expenseData,
      );
    };

    pushAggregateRow(
      `${rowId}-income`,
      accumulator.incomeMonthly,
      accumulator.incomeTransactions,
    );
    pushAggregateRow(
      `${rowId}-expense`,
      accumulator.expenseMonthly,
      accumulator.expenseTransactions,
    );
  });
}

// Checked or unchecked category with no subcategories: use the category-level rollup
export function addCategoryRow({
  baseId,
  category,
  t,
  incomeData,
  expenseData,
}: AddRowProps) {
  const monthly = category.breakdownByMonth.map((month) =>
    roundTwoDecimals(month.total),
  );
  pushData(
    {
      id: baseId,
      description: getLocalizedCategory(category.category, t),
      category: category.category,
      monthly,
      average: category.averagePerMonth,
      total: category.total,
    },
    incomeData,
    expenseData,
  );
}
