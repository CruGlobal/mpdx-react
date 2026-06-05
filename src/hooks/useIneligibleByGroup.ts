import { useMemo } from 'react';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum } from 'src/graphql/types.generated';

const isInEligibleGroup = (
  group: UsStaffGroupEnum | null | undefined,
  eligibleGroups: UsStaffGroupEnum[],
) => {
  return typeof group === 'string' && eligibleGroups.includes(group);
};

export function useIneligibleByGroup() {
  const { data, loading: userLoading, error: userError } = useGetUserQuery();

  const usStaffGroup = data?.user.usStaffGroup;
  const spouseUsStaffGroup = data?.user.spouseUsStaffGroup;
  const userType = data?.user.userType;
  const hasNoStaffAccount = !data?.user.staffAccountId;

  const { SeniorStaff, NewStaff, NationalExpat, PaidWithDesignation } =
    UsStaffGroupEnum;

  // Is ASR ineligible if both user and spouse are not Senior Staff, New Staff, or National Expat
  const asrGroups = [SeniorStaff, NewStaff, NationalExpat];
  const inAsrIneligibleGroup =
    !isInEligibleGroup(usStaffGroup, asrGroups) &&
    !isInEligibleGroup(spouseUsStaffGroup, asrGroups);

  // Is MHA ineligible if both user and spouse are not Senior Staff or National Expat
  const mhaAndSalaryGroups = [SeniorStaff, NationalExpat];
  const inMhaIneligibleGroup =
    !isInEligibleGroup(usStaffGroup, mhaAndSalaryGroups) &&
    !isInEligibleGroup(spouseUsStaffGroup, mhaAndSalaryGroups);

  const inSalaryCalcIneligibleGroup = !isInEligibleGroup(
    usStaffGroup,
    mhaAndSalaryGroups,
  );
  const inMpdGoalCalcIneligibleGroup = !isInEligibleGroup(usStaffGroup, [
    SeniorStaff,
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
      inPdsGoalCalcIneligibleGroup,
      userType,
      hasNoStaffAccount,
      userLoading,
      userError,
    ],
  );
}
