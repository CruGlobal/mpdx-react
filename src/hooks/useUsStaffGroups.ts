import { useMemo } from 'react';
import {
  HcmQuery,
  useHcmQuery,
} from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
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
 * This hook determines whether a US Staff user is in a subgroup that's ineligible for ASR, Salary Calculator, MHA, or the MPD / PDS Goal Calculators (all reports that require HCM).
 * The ASR and MHA check runs against the eligible person (logged-in user if eligible, otherwise spouse, otherwise the logged-in user).
 * The Salary Calculator and MPD Goal Calculator checks always run against the logged-in user.
 */
export function useUsStaffGroups(skip?: boolean) {
  const { data, loading, error } = useHcmQuery({
    skip,
    context: { suppressErrors: true, doNotBatch: true },
  });
  const people = data?.hcm ?? [];
  const [user] = people;

  const allAsrIneligible =
    !!people.length &&
    people.every((person) => person?.asrEit?.asrEligibility === false);
  const allMhaIneligible =
    !!people.length &&
    people.every((person) => mhaIneligible(person.staffInfo));

  // If there is no staff account, we want to hide all reports that require it
  const hasNoStaffAccount =
    error?.graphQLErrors.some(
      (graphQLError) => graphQLError.extensions?.code === 'NO_STAFF_ACCOUNT',
    ) ?? false;

  const inAsrIneligibleGroup = hasNoStaffAccount || allAsrIneligible;
  const inSalaryCalcIneligibleGroup =
    hasNoStaffAccount || user?.salaryRequestEligible === false;
  const inMhaIneligibleGroup = hasNoStaffAccount || allMhaIneligible;
  const inMpdGoalCalcIneligibleGroup = user?.salaryRequestEligible === false;
  // TODO: follow-up PR will replace this hardcoded value with a backend eligibility check.
  const inPdsGoalCalcIneligibleGroup = true;

  return useMemo(
    () => ({
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      inMpdGoalCalcIneligibleGroup,
      inPdsGoalCalcIneligibleGroup,
      hasNoStaffAccount,
      loading: loading && !data,
    }),
    [
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      inMpdGoalCalcIneligibleGroup,
      inPdsGoalCalcIneligibleGroup,
      hasNoStaffAccount,
      loading,
      data,
    ],
  );
}
