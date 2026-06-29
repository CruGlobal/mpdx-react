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

interface BreakdownByMonth {
  month: string;
  total: number;
}

interface SubCategories {
  averagePerMonth: number;
  total: number;
  subCategory: StaffExpensesSubCategoryEnum;
  breakdownByMonth: BreakdownByMonth[];
}
interface Categories {
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
