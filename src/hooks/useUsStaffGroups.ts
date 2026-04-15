import { useMemo } from 'react';
import { useUserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';
import {
  AssignmentCategoryEnum,
  AssignmentStatusEnum,
  PeopleGroupSupportTypeEnum,
  UserPersonTypeEnum,
  UserTypeEnum,
} from 'src/graphql/types.generated';
import { HcmQuery } from '../components/Reports/Shared/HcmData/Hcm.generated';

export function useUsStaffGroups(user: HcmQuery['hcm'][number] | undefined) {
  const { userType } = useUserPreferenceContext();
  const staff = user?.staffInfo;

  if (userType && userType !== UserTypeEnum.UsStaff) {
    return;
  }

  const seniorStaff =
    staff?.peopleGroupSupportType === PeopleGroupSupportTypeEnum.SupportedRmo &&
    staff?.assignmentStatus === AssignmentStatusEnum.ActivePayrollEligible &&
    staff?.assignmentCategory === AssignmentCategoryEnum.FullTimeRegular;

  const newStaff =
    staff?.peopleGroupSupportType === PeopleGroupSupportTypeEnum.SupportedRmo &&
    (staff?.assignmentStatus ===
      AssignmentStatusEnum.RaisingInitialSupportPayrollEligible ||
      staff?.assignmentStatus ===
        AssignmentStatusEnum.RaisingInitialSupportNoPayroll);

  const partTimeFieldStaff =
    staff?.userPersonType === UserPersonTypeEnum.EmployeePtfs;

  const paidWithDesignation =
    staff?.peopleGroupSupportType === PeopleGroupSupportTypeEnum.Designation;

  const intern =
    staff?.userPersonType === UserPersonTypeEnum.EmployeeInternationalIntern ||
    staff?.userPersonType === UserPersonTypeEnum.EmployeeUsIntern;

  return useMemo(
    () => ({
      seniorStaff,
      newStaff,
      partTimeFieldStaff,
      paidWithDesignation,
      intern,
    }),
    [
      user,
      seniorStaff,
      newStaff,
      partTimeFieldStaff,
      paidWithDesignation,
      intern,
    ],
  );
}
