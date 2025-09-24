export enum ReportTypeEnum {
  Income = 'income',
  Expenses = 'expenses',
}

export enum FundTypes {
  Primary = 'Primary',
}

export enum ExpenseCategoriesEnum {
  Transfer = 'Transfer',
  Ministry = 'Ministry Reimbursement',
  Healthcare = 'Healthcare Reimbursement',
  AdditionalSalary = 'Additional Salary',
  Salary = 'Salary',
  Benefits = 'Benefits',
  Other = 'Other',
  Assessment = 'Assessment',
}

interface BreakdownByMonth {
  month: string;
  total: number;
}

interface SubCategories {
  averagePerMonth: number;
  total: number;
  subCategory: string;
  breakdownByMonth: BreakdownByMonth[];
}
interface Categories {
  averagePerMonth: number;
  total: number;
  category: string;
  subcategories: SubCategories[];
  breakdownByMonth: BreakdownByMonth[];
}

export interface Funds {
  fundType: string;
  categories: Categories[];
  total: number;
}
