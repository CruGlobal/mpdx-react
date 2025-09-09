import { useMemo } from 'react';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { useGoalCalculator } from '../GoalCalculatorContext';
import { getFamilyTotal, getPrimaryTotal } from './helpers';

export interface Goal {
  netMonthlySalary: number;
  taxesPercentage: number;
  rothContributionPercentage: number;
  traditionalContributionPercentage: number;
  ministryExpenses: MinistryExpenses;
  ministryExpensesTotal: number;
}

export interface MinistryExpenses {
  benefitsCharge: number;
  primaryCategories: Array<{
    category: PrimaryBudgetCategoryEnum;
    label: string;
    amount: number;
  }>;
}

export const useReportExpenses = () => {
  const {
    goalCalculationResult: { data: goalData, loading },
  } = useGoalCalculator();

  const ministryExpenses: MinistryExpenses | null = useMemo(() => {
    if (!goalData?.goalCalculation) {
      return null;
    }
    const ministryFamily = goalData.goalCalculation.ministryFamily;

    const primaryCategories = ministryFamily?.primaryBudgetCategories.map(
      (primary) => ({
        category: primary.category,
        label: primary.label,
        amount: getPrimaryTotal(primary),
      }),
    );

    return {
      benefitsCharge: 0,
      primaryCategories,
    };
  }, [goalData]);

  const ministryExpensesTotal = useMemo(() => {
    if (!goalData?.goalCalculation?.ministryFamily) {
      return 0;
    }
    return getFamilyTotal(goalData.goalCalculation.ministryFamily);
  }, [goalData]);

  return {
    ministryExpenses,
    ministryExpensesTotal,
    loading,
  };
};
