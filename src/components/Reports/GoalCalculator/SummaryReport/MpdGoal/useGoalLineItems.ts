import { useMemo } from 'react';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { Goal } from './MpdGoalTable';
import { useAccountListSupportRaisedQuery } from './MpdGoalTable.generated';

export interface GoalTableLineItems {
  taxes: number;
  salaryPreIra: number;
  rothContribution: number;
  traditionalContribution: number;
  grossAnnualSalary: number;
  grossMonthlySalary: number;
  totalMinistryExpenses: number;
  overallSubtotal: number;
  overallSubtotalWithAdmin: number;
  overallTotal: number;
  supportRaised: number;
  supportRemaining: number;
  supportRaisedPercentage: number;
}

export const useGoalLineItems = (goal: Goal): GoalTableLineItems => {
  const accountListId = useAccountListId() ?? '';
  const { data } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
  });

  const lineItems = useMemo<GoalTableLineItems>(() => {
    const { ministryExpenses } = goal;
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

    const totalMinistryExpenses =
      ministryExpenses.benefitsCharge +
      ministryExpenses.ministryMileage +
      ministryExpenses.medicalMileage +
      ministryExpenses.medicalExpenses +
      ministryExpenses.ministryPartnerDevelopment +
      ministryExpenses.communications +
      ministryExpenses.entertainment +
      ministryExpenses.staffDevelopment +
      ministryExpenses.supplies +
      ministryExpenses.technology +
      ministryExpenses.travel +
      ministryExpenses.transfers +
      ministryExpenses.other;

    const overallSubtotal = grossMonthlySalary + totalMinistryExpenses;
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
      totalMinistryExpenses,
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
