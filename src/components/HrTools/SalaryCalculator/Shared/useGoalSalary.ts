import { useCallback, useMemo } from 'react';
import { DateTime } from 'luxon';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import {
  calculateGoalGrossAnnualSalaries,
  hasStaffSpouse,
} from '../../GoalCalculator/Shared/calculateTotals';
import { pickPrimaryGoal } from '../../GoalCalculator/Shared/pickPrimaryGoal';
import { GoalSalaryQuery, useGoalSalaryQuery } from './GoalSalary.generated';
import { estimateRequestedSalary } from './estimateRequestedSalary';

type Calculations = Parameters<typeof estimateRequestedSalary>[1];

interface HcmPerson {
  staffInfo: { firstName: string; preferredName?: string | null };
}

type Goal = GoalSalaryQuery['goalCalculations']['nodes'][number];

const normalizeName = (name: string | null | undefined) =>
  name?.trim().toLowerCase() ?? '';

// Whether a name typed on the goal is this person's legal or preferred first name
const isNamed = (person: HcmPerson | null, name: string | null | undefined) => {
  const goalName = normalizeName(name);
  return (
    !!person &&
    !!goalName &&
    [person.staffInfo.firstName, person.staffInfo.preferredName].some(
      (personName) => normalizeName(personName) === goalName,
    )
  );
};

/**
 * Whether the goal's first person is the staff member's spouse. The goal's first person is whoever
 * created it, and the goal only stores the names typed on it, so match those to HCM. Null when the
 * names don't say who is who.
 */
const isSpouseFirst = (
  goal: Goal,
  hcmUser: HcmPerson | null,
  hcmSpouse: HcmPerson | null,
): boolean | null => {
  if (!hasStaffSpouse(goal.familySize)) {
    return false;
  }

  const userFirst =
    isNamed(hcmUser, goal.firstName) ||
    isNamed(hcmSpouse, goal.spouseFirstName);
  const spouseFirst =
    isNamed(hcmSpouse, goal.firstName) ||
    isNamed(hcmUser, goal.spouseFirstName);
  return userFirst === spouseFirst ? null : spouseFirst;
};

export interface GoalSalaries {
  salary: number | null;
  spouseSalary: number | null;
}

export interface UseGoalSalaryResult {
  /** The staff member's MPD Goal for this year, if they have one */
  goal: Goal | undefined;
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
  const accountListId = useAccountListId();
  const { data, error, fetchMore } = useGoalSalaryQuery({
    variables: { accountListId },
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

      // Rather than risk giving each person the other's salary
      const spouseFirst = isSpouseFirst(goal, hcmUser, hcmSpouse);
      if (spouseFirst === null) {
        return null;
      }

      const { grossAnnualSalary, spouseGrossAnnualSalary } =
        calculateGoalGrossAnnualSalaries(goal);
      const userGross = spouseFirst
        ? spouseGrossAnnualSalary
        : grossAnnualSalary;
      const spouseGross = spouseFirst
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
