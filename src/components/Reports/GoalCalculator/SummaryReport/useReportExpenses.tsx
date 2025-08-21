import { useMemo } from 'react';
import {
  Maybe,
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { useGoalCalculationQuery } from './GoalCalculation.generated';
import {
  getMinistryExpensesTotal,
  getPrimaryTotal,
  getSubTotal,
} from './helpers';

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
    subAmounts: Array<{
      category: Maybe<SubBudgetCategoryEnum> | undefined;
      amount: number;
    }>;
  }>;
}

export const useReportExpenses = (
  accountListId: string,
  goalCalculationId: string,
) => {
  const { data: goalData, loading } = useGoalCalculationQuery({
    variables: {
      accountListId,
      goalCalculationId,
    },
  });
  const expenses: MinistryExpenses | null = useMemo(() => {
    if (!goalData?.goalCalculation) {
      return null;
    }
    const ministryFamily = goalData.goalCalculation.ministryFamily;

    const primaryCategories = ministryFamily?.primaryBudgetCategories.map(
      (primary) => ({
        category: primary.category,
        label: primary.label,
        amount: getPrimaryTotal(ministryFamily, primary.category),
        subAmounts: primary.subBudgetCategories.map((sub) => ({
          category: sub.category,
          amount: sub.category
            ? getSubTotal(ministryFamily, primary.category, sub.category)
            : 0,
        })),
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
    return getMinistryExpensesTotal(goalData.goalCalculation.ministryFamily);
  }, [goalData]);

  return {
    expenses,
    ministryExpensesTotal,
    loading,
  };
};
