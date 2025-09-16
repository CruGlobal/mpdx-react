import { useMemo } from 'react';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useAccountListSupportRaisedQuery } from './GoalLineItems.generated';

export interface GoalTableLineItems {
  taxes: number;
  salaryPreIra: number;
  rothContribution: number;
  traditionalContribution: number;
  grossAnnualSalary: number;
  grossMonthlySalary: number;
  ministryExpensesTotal: number;
  overallSubtotal: number;
  overallSubtotalWithAdmin: number;
  overallTotal: number;
  supportRaised: number;
  supportRemaining: number;
  supportRaisedPercentage: number;
}

export interface GoalLineItemsInput {
  netMonthlySalary: number;
  taxesPercentage: number;
  rothContributionPercentage: number;
  traditionalContributionPercentage: number;
  ministryExpensesTotal: number;
}

export const useGoalLineItems = (
  goal: GoalLineItemsInput,
): GoalTableLineItems => {
  const accountListId = useAccountListId() ?? '';
  const { data } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
  });

  const lineItems = useMemo<GoalTableLineItems>(() => {
    const { ministryExpensesTotal } = goal;
    const taxes = goal.netMonthlySalary * goal.taxesPercentage;
    const salaryPreIra = goal.netMonthlySalary + taxes;
    const rothContribution =
      salaryPreIra / (1 - goal.rothContributionPercentage) - salaryPreIra;
    const traditionalContribution =
      salaryPreIra / (1 - goal.traditionalContributionPercentage) -
      salaryPreIra;
    const grossMonthlySalary =
      salaryPreIra + rothContribution + traditionalContribution;
    const grossAnnualSalary = grossMonthlySalary * 12;

    const overallSubtotal = grossMonthlySalary + ministryExpensesTotal;
    const overallSubtotalWithAdmin = overallSubtotal / 0.88;
    const overallTotal = overallSubtotalWithAdmin * 1.06;
    const supportRaised = data?.accountList.receivedPledges ?? 0;
    const supportRemaining = overallTotal - supportRaised;
    const supportRaisedPercentage = supportRaised / overallTotal;

    return {
      taxes,
      salaryPreIra,
      rothContribution,
      traditionalContribution,
      grossAnnualSalary,
      grossMonthlySalary,
      ministryExpensesTotal,
      overallSubtotal,
      overallSubtotalWithAdmin,
      overallTotal,
      supportRaised,
      supportRemaining,
      supportRaisedPercentage,
    };
  }, [goal, data]);

  return lineItems;
};
