import React from 'react';
import { renderHook } from '@testing-library/react';
import { HcmQuery } from 'src/components/Reports/Shared/HcmData/Hcm.generated';
import { singleNoMhaNoException } from 'src/components/Reports/Shared/HcmData/mockData';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import {
  AssignmentCategoryEnum,
  AssignmentStatusEnum,
  PeopleGroupSupportTypeEnum,
  UserPersonTypeEnum,
  UserTypeEnum,
} from 'src/graphql/types.generated';
import { useUsStaffGroups } from './useUsStaffGroups';

const createWrapper = (
  userType: UserTypeEnum,
): React.FC<{ children: React.ReactNode }> => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const value: UserPreferenceType = { locale: 'en-US', userType };
    return React.createElement(
      UserPreferenceContext.Provider,
      { value },
      children,
    );
  };
  Wrapper.displayName = `UserPreferenceWrapper(${userType})`;
  return Wrapper;
};

const usStaffWrapper = createWrapper(UserTypeEnum.UsStaff);
const globalStaffWrapper = createWrapper(UserTypeEnum.GlobalStaff);

const baseUser = singleNoMhaNoException[0];
const mockUser: HcmQuery['hcm'][number] = {
  ...baseUser,
  staffInfo: {
    ...baseUser.staffInfo,
  },
};

describe('useUsStaffGroups', () => {
  it('returns when user is not US Staff', () => {
    const { result } = renderHook(() => useUsStaffGroups(mockUser), {
      wrapper: globalStaffWrapper,
    });

    expect(result.current).toBeUndefined();
  });

  it('returns correct staff group booleans for a senior staff user', () => {
    const user = {
      staffInfo: {
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
        assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
        assignmentCategory: AssignmentCategoryEnum.FullTimeRegular,
      },
    };

    const { result } = renderHook(
      () =>
        useUsStaffGroups({
          ...mockUser,
          staffInfo: { ...mockUser.staffInfo, ...user.staffInfo },
        }),
      { wrapper: usStaffWrapper },
    );

    expect(result.current).toEqual({
      seniorStaff: true,
      newStaff: false,
      partTimeFieldStaff: false,
      paidWithDesignation: false,
      intern: false,
    });
  });

  it('returns correct staff group booleans for a new staff user', () => {
    const user = {
      staffInfo: {
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
        assignmentStatus:
          AssignmentStatusEnum.RaisingInitialSupportPayrollEligible,
      },
    };

    const { result } = renderHook(
      () =>
        useUsStaffGroups({
          ...mockUser,
          staffInfo: { ...mockUser.staffInfo, ...user.staffInfo },
        }),
      { wrapper: usStaffWrapper },
    );

    expect(result.current).toEqual({
      seniorStaff: false,
      newStaff: true,
      partTimeFieldStaff: false,
      paidWithDesignation: false,
      intern: false,
    });
  });

  it('returns correct staff group booleans for a part-time field staff user', () => {
    const user = {
      staffInfo: {
        userPersonType: UserPersonTypeEnum.EmployeePtfs,
      },
    };

    const { result } = renderHook(
      () =>
        useUsStaffGroups({
          ...mockUser,
          staffInfo: { ...mockUser.staffInfo, ...user.staffInfo },
        }),
      { wrapper: usStaffWrapper },
    );

    expect(result.current).toEqual({
      seniorStaff: false,
      newStaff: false,
      partTimeFieldStaff: true,
      paidWithDesignation: false,
      intern: false,
    });
  });

  it('returns correct staff group booleans for a paid with designation user', () => {
    const user = {
      staffInfo: {
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.Designation,
      },
    };

    const { result } = renderHook(
      () =>
        useUsStaffGroups({
          ...mockUser,
          staffInfo: { ...mockUser.staffInfo, ...user.staffInfo },
        }),
      { wrapper: usStaffWrapper },
    );

    expect(result.current).toEqual({
      seniorStaff: false,
      newStaff: false,
      partTimeFieldStaff: false,
      paidWithDesignation: true,
      intern: false,
    });
  });

  it('returns correct staff group booleans for an intern user', () => {
    const user = {
      staffInfo: {
        userPersonType: UserPersonTypeEnum.EmployeeUsIntern,
      },
    };

    const { result } = renderHook(
      () =>
        useUsStaffGroups({
          ...mockUser,
          staffInfo: { ...mockUser.staffInfo, ...user.staffInfo },
        }),
      { wrapper: usStaffWrapper },
    );

    expect(result.current).toEqual({
      seniorStaff: false,
      newStaff: false,
      partTimeFieldStaff: false,
      paidWithDesignation: false,
      intern: true,
    });
  });
});
