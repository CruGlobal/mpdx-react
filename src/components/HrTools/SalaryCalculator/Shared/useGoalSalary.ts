import { useCallback, useMemo } from 'react';
import { DateTime } from 'luxon';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { calculateGoalGrossAnnualSalaries } from '../../GoalCalculator/Shared/calculateTotals';
import { pickPrimaryGoal } from '../../GoalCalculator/Shared/pickPrimaryGoal';
import { GoalSalaryQuery, useGoalSalaryQuery } from './GoalSalary.generated';
import { estimateRequestedSalary } from './estimateRequestedSalary';

type Calculations = Parameters<typeof estimateRequestedSalary>[1];

interface HcmPerson {
  staffInfo: { firstName: string };
}

export interface GoalSalaries {
  salary: number | null;
  spouseSalary: number | null;
}

export interface UseGoalSalaryResult {
  /** The staff member's MPD Goal for this year, if they have one */
  goal: GoalSalaryQuery['goalCalculations']['nodes'][number] | undefined;
  loading: boolean;
  /**
   * Convert the goal's gross salary into requested salaries using the request's own SECA and
   * 403(b) rates, so the request's gross matches the goal's. Null without a goal salary.
   */
  getGoalSalaries: (
    calculations: Calculations,
    spouseCalculations: Calculations,
  ) => GoalSalaries | null;
}

/**
 * The salary from the staff member's current MPD Goal, for the Salary Calculation Form. `hcmSpouse`
 * should be null when the form has no spouse.
 */
export const useGoalSalary = (
  hcmUser: HcmPerson | null,
  hcmSpouse: HcmPerson | null,
): UseGoalSalaryResult => {
  const accountListId = useAccountListId() ?? '';
  const { data, error, fetchMore } = useGoalSalaryQuery({
    variables: { accountListId },
    skip: !accountListId,
  });
  const { loading } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.goalCalculations.pageInfo,
  });

  const goal = useMemo(() => {
    // Older goals use an earlier year's rates and are likely out of date
    const currentYear = DateTime.now().year;
    const goals = data?.goalCalculations.nodes
      .filter((goal) => goal.calculationsYear === currentYear)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return pickPrimaryGoal(goals);
  }, [data]);

  const getGoalSalaries = useCallback(
    (calculations: Calculations, spouseCalculations: Calculations) => {
      if (!goal) {
        return null;
      }

      const { grossAnnualSalary, spouseGrossAnnualSalary } =
        calculateGoalGrossAnnualSalaries(goal);
      // The goal's first person is whoever created it, which may be the spouse
      const spouseMadeGoal =
        !!hcmSpouse &&
        goal.firstName === hcmSpouse.staffInfo.firstName &&
        goal.firstName !== hcmUser?.staffInfo.firstName;
      const userGross = spouseMadeGoal
        ? spouseGrossAnnualSalary
        : grossAnnualSalary;
      const spouseGross = spouseMadeGoal
        ? grossAnnualSalary
        : spouseGrossAnnualSalary;

      const salary = estimateRequestedSalary(userGross, calculations);
      const spouseSalary = hcmSpouse
        ? estimateRequestedSalary(spouseGross, spouseCalculations)
        : null;
      return salary === null && spouseSalary === null
        ? null
        : { salary, spouseSalary };
    },
    [goal, hcmUser, hcmSpouse],
  );

  return { goal, loading, getGoalSalaries };
};
