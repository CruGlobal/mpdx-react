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
  // The default cache-and-network policy reports loading on every refetch, even
  // with the user already cached, so only treat the user as unknown before then
  const userPending = userLoading && !data;

  const usStaffGroup = getBaseGroup(data?.user.usStaffGroup);
  const spouseUsStaffGroup = getBaseGroup(data?.user.spouseUsStaffGroup);
  const userType = data?.user.userType;
  const hasNoStaffAccount = !data?.user.staffAccountId;
  const supervisesStaff = data?.user.supervisesStaff;
  // A role rather than a group: the MPD Goals team and MPD coordinators only.
  const canViewNewStaffCohorts = !!data?.user.canViewNewStaffCohorts;

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

  const inMpdSupervisorIneligibleGroup = !supervisesStaff;

  // Paid with designation staff have no active staff account, so tools and
  // reports built on one would be empty
  const inStaffAccountIneligibleGroup = usStaffGroup === PaidWithDesignation;
  // The account list balance is real when the spouse is supported staff
  const hasNoAccountBalance =
    usStaffGroup === PaidWithDesignation &&
    (!spouseUsStaffGroup || spouseUsStaffGroup === PaidWithDesignation);

  return useMemo(
    () => ({
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      inMpdGoalCalcIneligibleGroup,
      inNsGoalCalcIneligibleGroup,
      inPdsGoalCalcIneligibleGroup,
      inMpdSupervisorIneligibleGroup,
      inStaffAccountIneligibleGroup,
      hasNoAccountBalance,
      canViewNewStaffCohorts,
      userType,
      hasNoStaffAccount,
      userLoading,
      userPending,
      userError,
    }),
    [
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      inMpdGoalCalcIneligibleGroup,
      inNsGoalCalcIneligibleGroup,
      inPdsGoalCalcIneligibleGroup,
      inMpdSupervisorIneligibleGroup,
      inStaffAccountIneligibleGroup,
      hasNoAccountBalance,
      canViewNewStaffCohorts,
      userType,
      hasNoStaffAccount,
      userLoading,
      userPending,
      userError,
    ],
  );
}
