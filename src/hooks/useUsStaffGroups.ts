import { useMemo } from 'react';
import {
  HcmQuery,
  useHcmQuery,
} from 'src/components/Reports/Shared/HcmData/Hcm.generated';
import {
  AssignmentCategoryEnum,
  AssignmentStatusEnum,
  PeopleGroupSupportTypeEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';

type StaffInfo = HcmQuery['hcm'][number]['staffInfo'];

const usStaffGroups = (staff: StaffInfo) => ({
  seniorStaff:
    staff?.peopleGroupSupportType === PeopleGroupSupportTypeEnum.SupportedRmo &&
    staff?.assignmentStatus === AssignmentStatusEnum.ActivePayrollEligible &&
    staff?.assignmentCategory === AssignmentCategoryEnum.FullTimeRegular,
  newStaff:
    staff?.peopleGroupSupportType === PeopleGroupSupportTypeEnum.SupportedRmo &&
    (staff?.assignmentStatus ===
      AssignmentStatusEnum.RaisingInitialSupportPayrollEligible ||
      staff?.assignmentStatus ===
        AssignmentStatusEnum.RaisingInitialSupportNoPayroll),
  partTimeFieldStaff: staff?.userPersonType === UserPersonTypeEnum.EmployeePtfs,
  paidWithDesignation:
    staff?.peopleGroupSupportType === PeopleGroupSupportTypeEnum.Designation,
  intern:
    staff?.userPersonType === UserPersonTypeEnum.EmployeeInternationalIntern ||
    staff?.userPersonType === UserPersonTypeEnum.EmployeeUsIntern,
});

/**
 * This hook determines whether a US Staff user is in a subgroup that's ineligible for ASR or Salary Calculator (see above groups).
 * It accepts an optional effectiveDate. When provided, the subgroup check always runs against the logged-in user. When omitted,
 * we pick the logged-in user if eligible, or their spouse if they are the one eligible, to check the subgroups against. If
 * neither is eligible, it defaults to the logged-in user, who will not be able to see the form anyway.
 */
export function useUsStaffGroups(skip: boolean, effectiveDate?: string) {
  const { data, loading } = useHcmQuery({
    variables: effectiveDate ? { effectiveDate } : undefined,
    skip,
  });
  const [user, spouse] = data?.hcm ?? [];

  // If ASR, figure out if user or spouse is eligible
  const asrEligiblePerson = user?.asrEit?.asrEligibility
    ? user
    : spouse?.asrEit?.asrEligibility
      ? spouse
      : undefined;

  const staff = effectiveDate ? user : (asrEligiblePerson ?? user);

  const { newStaff, partTimeFieldStaff, paidWithDesignation, intern } =
    usStaffGroups(staff?.staffInfo);

  const inAsrIneligibleGroup = paidWithDesignation || intern;
  const inSalaryCalcIneligibleGroup =
    newStaff || partTimeFieldStaff || paidWithDesignation || intern;

  return useMemo(
    () => ({
      inAsrIneligibleGroup,
      inSalaryCalcIneligibleGroup,
      loading: loading && !skip,
    }),
    [inAsrIneligibleGroup, inSalaryCalcIneligibleGroup, loading, skip],
  );
}
