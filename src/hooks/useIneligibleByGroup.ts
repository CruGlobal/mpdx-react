import { useMemo } from 'react';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum } from 'src/graphql/types.generated';

export function useIneligibleByGroup() {
  const { data, loading: userLoading, error: userError } = useGetUserQuery();

  const usStaffGroup = data?.user.usStaffGroup;
  const userType = data?.user.userType;
  const hasNoStaffAccount = !data?.user.staffAccountId;

  const isSeniorStaff = usStaffGroup === UsStaffGroupEnum.SeniorStaff;
  const isNationalExpat = usStaffGroup === UsStaffGroupEnum.NationalExpat;

  const inAsrIneligibleGroup =
    !isSeniorStaff &&
    usStaffGroup !== UsStaffGroupEnum.NewStaff &&
    !isNationalExpat;
  const inSalaryCalcIneligibleGroup = !isSeniorStaff && !isNationalExpat;
  const inMhaIneligibleGroup = !isSeniorStaff && !isNationalExpat;
  const inMpdGoalCalcIneligibleGroup = !isSeniorStaff;
  const inPdsGoalCalcIneligibleGroup =
    usStaffGroup !== UsStaffGroupEnum.PaidWithDesignation;

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
