import { useMemo } from 'react';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum } from 'src/graphql/types.generated';

// International staff and staff stints are senior or new staff for eligibility
// purposes, so resolve them to that group before any check below runs
const BASE_GROUPS: Partial<Record<UsStaffGroupEnum, UsStaffGroupEnum>> = {
  [UsStaffGroupEnum.SeniorInternationalStaff]: UsStaffGroupEnum.SeniorStaff,
  [UsStaffGroupEnum.NewInternationalStaff]: UsStaffGroupEnum.NewStaff,
  [UsStaffGroupEnum.SeniorStaffStint]: UsStaffGroupEnum.SeniorStaff,
  [UsStaffGroupEnum.NewStaffStint]: UsStaffGroupEnum.NewStaff,
};

const getBaseGroup = (group: UsStaffGroupEnum | null | undefined) => {
  if (!group) {
    return null;
  }
  return BASE_GROUPS[group] || group;
};

const isInEligibleGroup = (
  group: UsStaffGroupEnum | null | undefined,
  eligibleGroups: UsStaffGroupEnum[],
) => {
  return typeof group === 'string' && eligibleGroups.includes(group);
};

export function useIneligibleByGroup() {
  const { data, loading: userLoading, error: userError } = useGetUserQuery();

  const usStaffGroup = getBaseGroup(data?.user.usStaffGroup);
  const spouseUsStaffGroup = getBaseGroup(data?.user.spouseUsStaffGroup);
  const userType = data?.user.userType;
  const hasNoStaffAccount = !data?.user.staffAccountId;

  const { SeniorStaff, NewStaff, NationalExpat, PaidWithDesignation } =
    UsStaffGroupEnum;

  // Is ASR or MHA ineligible if both user and spouse are not Senior Staff or National Expat
  const payrollToolGroups = [SeniorStaff, NationalExpat];
  const inHouseholdIneligibleGroup =
    !isInEligibleGroup(usStaffGroup, payrollToolGroups) &&
    !isInEligibleGroup(spouseUsStaffGroup, payrollToolGroups);

  const inAsrIneligibleGroup = inHouseholdIneligibleGroup;
  const inMhaIneligibleGroup = inHouseholdIneligibleGroup;

  const inSalaryCalcIneligibleGroup = !isInEligibleGroup(
    usStaffGroup,
    payrollToolGroups,
  );
  const inMpdGoalCalcIneligibleGroup = !isInEligibleGroup(usStaffGroup, [
    SeniorStaff,
  ]);
  const inNsGoalCalcIneligibleGroup = !isInEligibleGroup(usStaffGroup, [
    NewStaff,
  ]);
  const inPdsGoalCalcIneligibleGroup = !isInEligibleGroup(usStaffGroup, [
    PaidWithDesignation,
  ]);

  return useMemo(
    () => ({
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      inMpdGoalCalcIneligibleGroup,
      inNsGoalCalcIneligibleGroup,
      inPdsGoalCalcIneligibleGroup,
      userType,
      hasNoStaffAccount,
      userLoading,
      userError,
    }),
    [
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      inMpdGoalCalcIneligibleGroup,
      inNsGoalCalcIneligibleGroup,
      inPdsGoalCalcIneligibleGroup,
      userType,
      hasNoStaffAccount,
      userLoading,
      userError,
    ],
  );
}
