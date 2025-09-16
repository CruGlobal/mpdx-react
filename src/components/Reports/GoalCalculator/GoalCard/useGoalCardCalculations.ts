import { useMemo } from 'react';
import {
  type GoalLineItemsInput,
  useGoalLineItems,
} from '../Shared/useGoalLineItems';
import { getFamilyTotal } from '../Shared/useReportExpenses/helpers';
import type { ListGoalCalculationFragment } from '../GoalsList/GoalCalculations.generated';

export const useGoalCardCalculations = (goal: ListGoalCalculationFragment) => {
  const goalForCalculation = useMemo((): GoalLineItemsInput => {
    const ministryExpensesTotal = getFamilyTotal(goal.ministryFamily);
    return {
      netMonthlySalary: getFamilyTotal(goal.householdFamily),
      taxesPercentage: 0.17,
      rothContributionPercentage: 0.04,
      traditionalContributionPercentage: 0.06,
      ministryExpensesTotal,
    };
  }, [goal.ministryFamily]);

  const calculations = useGoalLineItems(goalForCalculation);

  return {
    overallTotal: calculations.overallTotal,
  };
};
