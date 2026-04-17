import React, { ReactElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HcmQuery } from 'src/components/Reports/Shared/HcmData/Hcm.generated';
import {
  AssignmentCategoryEnum,
  AssignmentStatusEnum,
  PeopleGroupSupportTypeEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';
import { useUsStaffGroups } from './useUsStaffGroups';

type StaffInfo = HcmQuery['hcm'][number]['staffInfo'];

interface BuildHcmMockOptions {
  spouse?: Partial<StaffInfo>;
  userAsrEligible?: boolean;
  spouseAsrEligible?: boolean;
}

const eligibleStaffInfo: Partial<StaffInfo> = {
  peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
  assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
  assignmentCategory: AssignmentCategoryEnum.FullTimeRegular,
  userPersonType: UserPersonTypeEnum.EmployeeStaff,
};

const buildHcmMock = (
  user: Partial<StaffInfo>,
  {
    spouse,
    userAsrEligible = true,
    spouseAsrEligible = true,
  }: BuildHcmMockOptions = {},
): HcmQuery => {
  const entries = [
    {
      staffInfo: { ...eligibleStaffInfo, ...user },
      asrEit: { asrEligibility: userAsrEligible },
    },
  ];
  if (spouse) {
    entries.push({
      staffInfo: { ...eligibleStaffInfo, ...spouse },
      asrEit: { asrEligibility: spouseAsrEligible },
    });
  }
  return { hcm: entries } as HcmQuery;
};

const renderUseUsStaffGroups = (hcmMock: HcmQuery, effectiveDate?: string) =>
  renderHook(() => useUsStaffGroups(effectiveDate), {
    wrapper: ({ children }: { children: ReactElement }) => (
      <GqlMockedProvider<{ Hcm: HcmQuery }> mocks={{ Hcm: hcmMock }}>
        {children}
      </GqlMockedProvider>
    ),
  });

describe('useUsStaffGroups', () => {
  it('marks senior staff as eligible for both ASR and salary calculator', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
        assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
        assignmentCategory: AssignmentCategoryEnum.FullTimeRegular,
      }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: false,
        loading: false,
      });
    });
  });

  it('marks new staff as eligible for ASR but ineligible for salary calculator', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
        assignmentStatus:
          AssignmentStatusEnum.RaisingInitialSupportPayrollEligible,
      }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: true,
        loading: false,
      });
    });
  });

  it('marks part-time field staff as eligible for ASR but ineligible for salary calculator', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        userPersonType: UserPersonTypeEnum.EmployeePtfs,
      }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: true,
        loading: false,
      });
    });
  });

  it('marks paid-with-designation staff as ineligible for both', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.Designation,
      }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: true,
        inSalaryCalcIneligibleGroup: true,
        loading: false,
      });
    });
  });

  it('marks interns as ineligible for both', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        userPersonType: UserPersonTypeEnum.EmployeeUsIntern,
      }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: true,
        inSalaryCalcIneligibleGroup: true,
        loading: false,
      });
    });
  });

  it('falls back to the spouse when the logged-in user is not ASR-eligible', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock(
        { userPersonType: UserPersonTypeEnum.EmployeeUsIntern },
        {
          spouse: {
            peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
            assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
            assignmentCategory: AssignmentCategoryEnum.FullTimeRegular,
          },
          userAsrEligible: false,
          spouseAsrEligible: true,
        },
      ),
    );

    await waitFor(() => {
      expect(result.current.inAsrIneligibleGroup).toBe(false);
    });
  });

  it('uses the logged-in user when an effectiveDate is provided, ignoring the spouse', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock(
        { userPersonType: UserPersonTypeEnum.EmployeeUsIntern },
        {
          spouse: {
            peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
            assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
            assignmentCategory: AssignmentCategoryEnum.FullTimeRegular,
          },
          userAsrEligible: false,
          spouseAsrEligible: true,
        },
      ),
      '2026-01-01',
    );

    await waitFor(() => {
      expect(result.current.inSalaryCalcIneligibleGroup).toBe(true);
    });
  });
});
