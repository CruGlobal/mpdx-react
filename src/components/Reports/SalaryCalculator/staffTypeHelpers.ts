import {
  AssignmentCategoryEnum,
  AssignmentStatusEnum,
  PeopleGroupSupportTypeEnum,
  StaffInfo,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';

export type StaffTypeFields = Pick<
  StaffInfo,
  | 'userPersonType'
  | 'peopleGroupSupportType'
  | 'assignmentStatus'
  | 'assignmentCategory'
>;

/**
 * Checks if staff member is a full-time RMO.
 * Reference Status Code: NX, SC
 */
export const isFullTimeRmo = (fields: StaffTypeFields): boolean => {
  const isValidPersonType =
    fields.userPersonType === UserPersonTypeEnum.EmployeeStaff ||
    fields.userPersonType === UserPersonTypeEnum.EmployeeNationalStaff;

  return (
    isValidPersonType &&
    fields.peopleGroupSupportType === PeopleGroupSupportTypeEnum.SupportedRmo &&
    fields.assignmentStatus === AssignmentStatusEnum.ActivePayrollEligible &&
    fields.assignmentCategory === AssignmentCategoryEnum.FullTimeRegular
  );
};

/**
 * Checks if staff member is new staff.
 * Reference Status Codes: SA, SD, SS, SSS
 */
export const isNewStaff = (fields: StaffTypeFields): boolean => {
  const isValidPersonType =
    fields.userPersonType === UserPersonTypeEnum.PendingStaff ||
    fields.userPersonType === UserPersonTypeEnum.EmployeeStaff;

  const isValidSupportType =
    fields.peopleGroupSupportType === PeopleGroupSupportTypeEnum.SupportedRmo ||
    fields.peopleGroupSupportType ===
      PeopleGroupSupportTypeEnum.SupportedNonRmo;

  const isValidStatus =
    fields.assignmentStatus === AssignmentStatusEnum.InactiveNoPayroll ||
    fields.assignmentStatus === AssignmentStatusEnum.PendingNoPayroll ||
    fields.assignmentStatus ===
      AssignmentStatusEnum.RaisingInitialPayrollEligible ||
    fields.assignmentStatus === AssignmentStatusEnum.RaisingInitialNoPayroll;

  const isValidCategory =
    fields.assignmentCategory === AssignmentCategoryEnum.FullTimeRegular;

  return (
    isValidPersonType && isValidSupportType && isValidStatus && isValidCategory
  );
};

/**
 * Checks if staff member is part-time (PTFS - Part Time Field Staff).
 * There is hourly part time, which is not included here.
 * Reference Status Codes: SAP, SCP, SFP, SWP
 */
export const isPartTime = (fields: StaffTypeFields): boolean => {
  const isValidStatus =
    fields.assignmentStatus === AssignmentStatusEnum.ActivePayrollEligible ||
    fields.assignmentStatus === AssignmentStatusEnum.InactiveNoPayroll ||
    fields.assignmentStatus === AssignmentStatusEnum.PendingNoPayroll;

  return (
    fields.userPersonType === UserPersonTypeEnum.EmployeePtfs &&
    fields.peopleGroupSupportType ===
      PeopleGroupSupportTypeEnum.SupportedNonRmo &&
    isValidStatus &&
    fields.assignmentCategory === AssignmentCategoryEnum.FullTimeRegular
  );
};
