import { MonthlyPayrollSummaryQuery } from './MonthlyPayrollSummary.generated';

export const mockMonthlySummary: MonthlyPayrollSummaryQuery['monthlyPayrollSummary'] =
  [
    {
      month: '2023-01',
      contributions: 4000,
      expenses: 3500,
      net: 500,
      endBalance: 10000,
      solidMonthlySupport: 3000,
      monthlyGoal: 4000,
      percentOfGoal: 75,
    },
    {
      month: '2023-02',
      contributions: 4200,
      expenses: 4500,
      net: -300,
      endBalance: 9700,
      solidMonthlySupport: 4500,
      monthlyGoal: 4000,
      percentOfGoal: 112.5,
    },
    {
      month: '2023-03',
      contributions: 3000,
      expenses: 3200,
      net: -200,
      endBalance: -100,
      solidMonthlySupport: 4500,
      monthlyGoal: null,
      percentOfGoal: null,
    },
  ];
