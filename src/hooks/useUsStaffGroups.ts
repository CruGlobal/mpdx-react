import { useMemo } from 'react';
import {
  HcmQuery,
  useHcmQuery,
} from 'src/components/Reports/Shared/HcmData/Hcm.generated';
import {
  AssignmentStatusEnum,
  PeopleGroupSupportTypeEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';

// Hide MHA tab by HR classification only; ignore mhaEligibility (IBS courses are resolvable).
function mhaIneligible(user: HcmQuery['hcm'][number]['staffInfo']) {
  const eligibleUserPersonType =
    user?.userPersonType === UserPersonTypeEnum.EmployeeStaff ||
    user?.userPersonType === UserPersonTypeEnum.EmployeeStaffNonRmoSpouse;
  const eligibleSupportType =
    user?.peopleGroupSupportType === PeopleGroupSupportTypeEnum.SupportedRmo;
  const eligibleAssignmentStatus =
    user?.assignmentStatus === AssignmentStatusEnum.ActivePayrollEligible;

  const isIneligible = !(
    eligibleUserPersonType &&
    eligibleSupportType &&
    eligibleAssignmentStatus
  );

  return isIneligible;
}

/**
 * This hook determines whether a US Staff user is in a subgroup that's ineligible for ASR, Salary Calculator, or MHA (all reports that require HCM).
 * The ASR check runs against the ASR-eligible person (logged-in user if eligible, otherwise spouse, otherwise the logged-in user).
 * The Salary Calculator and MHA check always runs against the logged-in user.
 */
export function useUsStaffGroups(skip?: boolean) {
  const { data, loading, error } = useHcmQuery({
    skip,
    context: { suppressErrors: true },
  });
  const [user, spouse] = data?.hcm ?? [];

  const eligibleUser = user?.asrEit?.asrEligibility
    ? user
    : spouse?.asrEit?.asrEligibility
      ? spouse
      : user;

  // If there is no staff account, we want to hide all HCM-related reports, so we treat the user as ineligible for all groups
  const hasNoStaffAccount =
    error?.graphQLErrors.some(
      (graphQLError) => graphQLError.extensions?.code === 'NO_STAFF_ACCOUNT',
    ) ?? false;

  const inAsrIneligibleGroup =
    hasNoStaffAccount || eligibleUser?.asrEit?.asrEligibility === false;
  const inSalaryCalcIneligibleGroup =
    hasNoStaffAccount || user?.salaryRequestEligible === false;
  const inMhaIneligibleGroup =
    hasNoStaffAccount || (!!user && mhaIneligible(user.staffInfo));

  return useMemo(
    () => ({
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      loading: loading && !data,
    }),
    [
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      loading,
      data,
    ],
  );
}
