import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';

export interface TransactionBreakdown {
  date: string;
  description: string;
  category: StaffExpenseCategoryEnum;
  subCategory: StaffExpensesSubCategoryEnum;
  amount: number;
}
export interface SubcategoryBreakdown {
  category: StaffExpenseCategoryEnum;
  subCategory: StaffExpensesSubCategoryEnum;
  transactions: TransactionBreakdown[];
  total: number;
}

export interface DataFields {
  id: string;
  description: string;
  category?: StaffExpenseCategoryEnum;
  monthly: number[];
  average: number;
  total: number;
}

export interface AllData {
  income: DataFields[];
  expenses: DataFields[];
  incomeBreakdown?: Partial<
    Record<StaffExpenseCategoryEnum, TransactionBreakdown[]>
  >;
  expenseBreakdown?: Partial<
    Record<StaffExpenseCategoryEnum, TransactionBreakdown[]>
  >;
}

export const months = [
  'Apr 2024',
  'May 2024',
  'Jun 2024',
  'Jul 2024',
  'Aug 2024',
  'Sep 2024',
  'Oct 2024',
  'Nov 2024',
  'Dec 2024',
  'Jan 2025',
  'Feb 2025',
  'Mar 2025',
];

export const mockTransactions: TransactionBreakdown[] = [
  {
    date: '2024-04-15T00:00:00Z',
    description: 'Monthly gift from the Smith family',
    category: StaffExpenseCategoryEnum.Donation,
    subCategory: StaffExpensesSubCategoryEnum.Donation,
    amount: 5000,
  },
  {
    date: '2024-04-22T00:00:00Z',
    description: 'One-time gift',
    category: StaffExpenseCategoryEnum.Donation,
    subCategory: StaffExpensesSubCategoryEnum.NonCash,
    amount: 1770,
  },
];

export const mockBreakdownData: Partial<
  Record<string, TransactionBreakdown[]>
> = {
  [StaffExpenseCategoryEnum.Donation]: [...mockTransactions],
};

export const mockData: AllData = {
  incomeBreakdown: {
    ...mockBreakdownData,
  },
  income: [
    {
      id: crypto.randomUUID(),
      description: 'Contributions',
      category: StaffExpenseCategoryEnum.Donation,
      monthly: [
        6770, 6090, 5770, 7355, 8035, 6575, 7556, 8239, 9799, 9729, 13020,
        19215,
      ],
      average: 9013,
      total: 108156,
    },
    {
      id: crypto.randomUUID(),
      description: 'Fr Andre, Fre to Mouna Ghar',
      monthly: [100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
      average: 58,
      total: 700,
    },
    {
      id: crypto.randomUUID(),
      description: 'All zeros test',
      monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      average: 0,
      total: 0,
    },
  ],
  expenses: [
    {
      id: crypto.randomUUID(),
      description: 'Transfers',
      category: StaffExpenseCategoryEnum.Transfer,
      monthly: [0, 0, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      average: 17,
      total: 200,
    },
    {
      id: crypto.randomUUID(),
      description: 'Ministry Reimbursements',
      category: StaffExpenseCategoryEnum.MinistryReimbursement,
      monthly: [0, 0, 0, 0, 0, 0, 565, 0, 488, 253, 818, 0],
      average: 177,
      total: 2124,
    },
    {
      id: crypto.randomUUID(),
      description: 'Healthcare Reimbursements',
      category: StaffExpenseCategoryEnum.HealthcareReimbursement,
      monthly: [0, 0, 0, 976, 55, 0, 0, 0, 194, 708, 0, 0],
      average: 161,
      total: 1933,
    },
    {
      id: crypto.randomUUID(),
      description: 'Benefits',
      category: StaffExpenseCategoryEnum.Benefits,
      monthly: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      average: 200,
      total: 2400,
    },
    {
      id: crypto.randomUUID(),
      description: 'Salary',
      category: StaffExpenseCategoryEnum.Salary,
      monthly: [26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      average: 2,
      total: 26,
    },
    {
      id: crypto.randomUUID(),
      description: 'Charge(s) for Credit Card gift(s)',
      category: StaffExpenseCategoryEnum.Other,
      monthly: [23, 23, 23, 45, 22, 22, 28, 24, 28, 29, 186, 55],
      average: 42,
      total: 507,
    },
    {
      id: crypto.randomUUID(),
      description: 'Assessments',
      category: StaffExpenseCategoryEnum.Assessment,
      monthly: [812, 731, 692, 883, 964, 789, 907, 989, 1176, 1227, 2237, 2372],
      average: 1148,
      total: 13779,
    },
  ],
};
