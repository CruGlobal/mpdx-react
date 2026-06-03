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
 * The ASR, MHA, and PDS Goal Calculator checks run against the eligible person (logged-in user if eligible, otherwise spouse, otherwise the logged-in user).
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
  const allPdsGoalCalcIneligible =
    !!people.length &&
    people.every(
      (person) => person?.designationSupportCalculatorEligible === false,
    );

  const hasNoStaffAccount =
    error?.graphQLErrors.some(
      (graphQLError) => graphQLError.extensions?.code === 'NO_STAFF_ACCOUNT',
    ) ?? false;

  const hcmPersonNotFound =
    error?.graphQLErrors.some(
      (graphQLError) =>
        graphQLError.extensions?.code === 'HCM_PERSON_NOT_FOUND',
    ) ?? false;

  const hasNoHcmData = hasNoStaffAccount || hcmPersonNotFound;

  const inAsrIneligibleGroup = hasNoHcmData || allAsrIneligible;
  const inSalaryCalcIneligibleGroup =
    hasNoHcmData || user?.salaryRequestEligible === false;
  const inMhaIneligibleGroup = hasNoHcmData || allMhaIneligible;
  const inMpdGoalCalcIneligibleGroup =
    hcmPersonNotFound || user?.salaryRequestEligible === false;
  const inPdsGoalCalcIneligibleGroup =
    hcmPersonNotFound || allPdsGoalCalcIneligible;

  return useMemo(
    () => ({
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      inMpdGoalCalcIneligibleGroup,
      inPdsGoalCalcIneligibleGroup,
      hasNoHcmData,
      loading: loading && !data,
    }),
    [
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      inMhaIneligibleGroup,
      inMpdGoalCalcIneligibleGroup,
      inPdsGoalCalcIneligibleGroup,
      hasNoHcmData,
      loading,
      data,
    ],
  );
}
