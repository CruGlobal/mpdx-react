import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';

export enum ReportTypeEnum {
  Income = 'income',
  Expenses = 'expenses',
}

export enum FundTypes {
  Primary = 'Primary',
}

interface Transaction {
  transactedAt: string;
  description?: string | null;
  amount: number;
}

interface BreakdownByMonth {
  month: string;
  total: number;
}

interface BreakdownByMonthWithTransactions extends BreakdownByMonth {
  transactions?: Transaction[] | null;
}

interface SubCategories {
  averagePerMonth: number;
  total: number;
  subCategory: StaffExpensesSubCategoryEnum;
  breakdownByMonth: BreakdownByMonthWithTransactions[];
}
export interface Categories {
  averagePerMonth: number;
  total: number;
  category: StaffExpenseCategoryEnum;
  subcategories: SubCategories[];
  breakdownByMonth: BreakdownByMonth[];
}

export interface Funds {
  fundType: string;
  categories: Categories[];
  total: number;
}
