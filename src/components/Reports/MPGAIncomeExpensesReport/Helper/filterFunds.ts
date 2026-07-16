import { TFunction } from 'react-i18next';
import {
  getLocalizedCategory,
  getLocalizedSubCategory,
  getPluralizedDescription,
} from '../../Shared/Helpers/transformStaffExpenseEnums';
import { DataFields } from '../mockData';
import { Categories } from './MPGAReportEnum';

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
  category.subcategories.forEach((subcategory) => {
    const subcategoryName = getLocalizedSubCategory(subcategory.subCategory, t);
    const id = `${baseId}-${subcategory.subCategory}`;
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

// Checked category with subcategories: combine its subcategories into one row
export function addCombinedSubcategoryRow({
  baseId,
  category,
  t,
  incomeData,
  expenseData,
}: AddRowProps) {
  const monthCount = category.breakdownByMonth.length;
  const incomeMonthly = new Array(monthCount).fill(0);
  const expenseMonthly = new Array(monthCount).fill(0);

  category.subcategories.forEach((subcategory) => {
    subcategory.breakdownByMonth.forEach((month, index) => {
      const value = roundTwoDecimals(month.total);
      const bucket = value >= 0 ? incomeMonthly : expenseMonthly;
      bucket[index] += value;
    });
  });

  const description =
    getPluralizedDescription(category.category, t) ||
    getLocalizedCategory(category.category, t);
  const pushAggregateRow = (id: string, monthly: number[]) => {
    pushData(
      {
        id,
        description,
        category: category.category,
        monthly,
        average: average(monthly),
        total: sum(monthly),
      },
      incomeData,
      expenseData,
    );
  };

  pushAggregateRow(`${baseId}-income`, incomeMonthly);
  pushAggregateRow(`${baseId}-expense`, expenseMonthly);
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
