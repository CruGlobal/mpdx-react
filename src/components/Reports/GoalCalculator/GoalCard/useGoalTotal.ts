import { useMemo } from 'react';
import { useGoalLineItems } from '../Shared/useGoalLineItems';
import { getFamilyTotal } from '../Shared/useReportExpenses/helpers';
import type { ListGoalCalculationFragment } from '../GoalsList/GoalCalculations.generated';
import type { Goal } from '../Shared/useReportExpenses/useReportExpenses';

export const useGoalTotal = (goal: ListGoalCalculationFragment) => {
  const goalForCalculation = useMemo((): Goal => {
    const ministryExpensesTotal = getFamilyTotal(goal.ministryFamily);
    return {
      netMonthlySalary: getFamilyTotal(goal.householdFamily),
      taxesPercentage: 0.17,
      rothContributionPercentage: 0.04,
      traditionalContributionPercentage: 0.06,
      ministryExpenses: {
        benefitsCharge: 0,
        primaryCategories: [],
      },
      ministryExpensesTotal,
    };
  }, [goal]);

  const calculations = useGoalLineItems(goalForCalculation);

  return calculations.overallTotal;
};
