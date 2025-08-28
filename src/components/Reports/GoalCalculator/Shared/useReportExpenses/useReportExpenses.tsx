import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getQueryParam } from 'src/utils/queryParam';
import { useGoalCalculationQuery } from '../../SummaryReport/GoalCalculation.generated';
import { getMinistryExpensesTotal, getPrimaryTotal } from './helpers';

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
  const accountListId = useAccountListId() ?? '';
  const { query } = useRouter();
  let goalCalculationId = getQueryParam(query, 'goalCalculationId') ?? '';

  // temporary
  goalCalculationId = 'aaea272a-3f02-47da-9304-86bd408eb11d';

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
    return getMinistryExpensesTotal(goalData.goalCalculation.ministryFamily);
  }, [goalData]);

  return {
    expenses,
    ministryExpensesTotal,
    loading,
  };
};
