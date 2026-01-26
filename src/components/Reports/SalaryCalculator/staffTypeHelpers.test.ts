import {
  AssignmentCategoryEnum,
  AssignmentStatusEnum,
  PeopleGroupSupportTypeEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';
import {
  StaffTypeFields,
  isFullTimeRmo,
  isNewStaff,
  isPartTime,
} from './staffTypeHelpers';

const mockStaff = (
  overrides: Partial<StaffTypeFields> = {},
): StaffTypeFields => ({
  userPersonType: UserPersonTypeEnum.EmployeeStaff,
  peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
  assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
  assignmentCategory: AssignmentCategoryEnum.FullTimeRegular,
  ...overrides,
});

describe('staffTypeHelpers', () => {
  describe('isFullTimeRmo', () => {
    it('returns true when all conditions match', () => {
      expect(isFullTimeRmo(mockStaff())).toBe(true);
    });

    it('returns true for Employee National Staff Expat', () => {
      expect(
        isFullTimeRmo(
          mockStaff({
            userPersonType: UserPersonTypeEnum.EmployeeNationalStaffExpat,
          }),
        ),
      ).toBe(true);
    });

    it('returns false when any condition fails', () => {
      expect(
        isFullTimeRmo(
          mockStaff({ userPersonType: UserPersonTypeEnum.PendingStaff }),
        ),
      ).toBe(false);
    });
  });

  describe('isNewStaff', () => {
    it('returns true when all conditions match', () => {
      const newStaff = mockStaff({
        userPersonType: UserPersonTypeEnum.PendingStaff,
        assignmentStatus: AssignmentStatusEnum.PendingNoPayroll,
      });

      expect(isNewStaff(newStaff)).toBe(true);
    });

    it('returns true for staff raising initial support', () => {
      const raisingInitial = mockStaff({
        userPersonType: UserPersonTypeEnum.EmployeeStaff,
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
        assignmentStatus:
          AssignmentStatusEnum.RaisingInitialSupportPayrollEligible,
        assignmentCategory: AssignmentCategoryEnum.FullTimeRegular,
      });

      expect(isNewStaff(raisingInitial)).toBe(true);
    });

    it('returns true for SupportedNonRmo staff', () => {
      const nonRmo = mockStaff({
        userPersonType: UserPersonTypeEnum.EmployeeStaff,
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedNonRmo,
        assignmentStatus: AssignmentStatusEnum.InactiveNoPayroll,
        assignmentCategory: AssignmentCategoryEnum.FullTimeRegular,
      });

      expect(isNewStaff(nonRmo)).toBe(true);
    });

    it('returns false when any condition fails', () => {
      expect(
        isNewStaff(
          mockStaff({
            assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
          }),
        ),
      ).toBe(false);
    });
  });

  describe('isPartTime', () => {
    it('returns true for PTFS with ActivePayrollEligible status', () => {
      const ptfs = mockStaff({
        userPersonType: UserPersonTypeEnum.EmployeePtfs,
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedNonRmo,
        assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
      });

      expect(isPartTime(ptfs)).toBe(true);
    });

    it('returns true for PTFS with InactiveNoPayroll status', () => {
      const ptfs = mockStaff({
        userPersonType: UserPersonTypeEnum.EmployeePtfs,
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedNonRmo,
        assignmentStatus: AssignmentStatusEnum.InactiveNoPayroll,
      });

      expect(isPartTime(ptfs)).toBe(true);
    });

    it('returns true for PTFS with PendingNoPayroll status', () => {
      const ptfs = mockStaff({
        userPersonType: UserPersonTypeEnum.EmployeePtfs,
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedNonRmo,
        assignmentStatus: AssignmentStatusEnum.PendingNoPayroll,
      });

      expect(isPartTime(ptfs)).toBe(true);
    });

    it('returns false when conditions not met', () => {
      expect(isPartTime(mockStaff())).toBe(false);
    });
  });
});
