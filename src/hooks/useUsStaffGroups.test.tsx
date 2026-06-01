import React, { ReactElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import {
  AssignmentStatusEnum,
  PeopleGroupSupportTypeEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';
import { useUsStaffGroups } from './useUsStaffGroups';

interface BuildHcmMockOptions {
  userAsrEligible?: boolean;
  userSalaryRequestEligible?: boolean;
  userMhaEligibility?: boolean;
  userPersonType?: UserPersonTypeEnum;
  peopleGroupSupportType?: PeopleGroupSupportTypeEnum;
  assignmentStatus?: AssignmentStatusEnum;
  includeSpouse?: boolean;
  spouseAsrEligible?: boolean;
}

const mhaEligibleStaffInfo = {
  userPersonType: UserPersonTypeEnum.EmployeeStaff,
  peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
  assignmentStatus: AssignmentStatusEnum.ActivePayrollEligible,
};

const buildHcmMock = ({
  userAsrEligible = true,
  userSalaryRequestEligible = true,
  userMhaEligibility = true,
  userPersonType = mhaEligibleStaffInfo.userPersonType,
  peopleGroupSupportType = mhaEligibleStaffInfo.peopleGroupSupportType,
  assignmentStatus = mhaEligibleStaffInfo.assignmentStatus,
  includeSpouse = false,
  spouseAsrEligible = true,
}: BuildHcmMockOptions = {}): HcmQuery => {
  const entries = [
    {
      asrEit: { asrEligibility: userAsrEligible },
      salaryRequestEligible: userSalaryRequestEligible,
      mhaEit: { mhaEligibility: userMhaEligibility },
      staffInfo: {
        userPersonType,
        peopleGroupSupportType,
        assignmentStatus,
      },
    },
  ];
  if (includeSpouse) {
    entries.push({
      asrEit: { asrEligibility: spouseAsrEligible },
      salaryRequestEligible: true,
      mhaEit: { mhaEligibility: true },
      staffInfo: { ...mhaEligibleStaffInfo },
    });
  }
  return { hcm: entries } as HcmQuery;
};

const renderUseUsStaffGroups = (hcmMock: HcmQuery, skip?: boolean) =>
  renderHook(() => useUsStaffGroups(skip), {
    wrapper: ({ children }: { children: ReactElement }) => (
      <GqlMockedProvider<{ Hcm: HcmQuery }> mocks={{ Hcm: hcmMock }}>
        {children}
      </GqlMockedProvider>
    ),
  });

describe('useUsStaffGroups', () => {
  it('marks an ASR-eligible, salary-eligible, MHA-eligible user as eligible', async () => {
    const { result } = renderUseUsStaffGroups(buildHcmMock());

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: false,
        inMhaIneligibleGroup: false,
        inMpdGoalCalcIneligibleGroup: false,
        inPdsGoalCalcIneligibleGroup: true,
        hasNoStaffAccount: false,
        loading: false,
      });
    });
  });

  it('marks user as salary-calc and mpd-goal-calc ineligible when salaryRequestEligible is false', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({ userSalaryRequestEligible: false }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: true,
        inMhaIneligibleGroup: false,
        inMpdGoalCalcIneligibleGroup: true,
        inPdsGoalCalcIneligibleGroup: true,
        hasNoStaffAccount: false,
        loading: false,
      });
    });
  });

  it('marks user as mha ineligible when userPersonType is not staff', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        userPersonType: UserPersonTypeEnum.EmployeeHourly,
      }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: false,
        inMhaIneligibleGroup: true,
        inMpdGoalCalcIneligibleGroup: false,
        inPdsGoalCalcIneligibleGroup: true,
        hasNoStaffAccount: false,
        loading: false,
      });
    });
  });

  it('marks user as mha ineligible when peopleGroupSupportType is not SupportedRmo', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedNonRmo,
      }),
    );

    await waitFor(() => {
      expect(result.current.inMhaIneligibleGroup).toBe(true);
    });
  });

  it('marks user as mha ineligible when assignmentStatus is not ActivePayrollEligible', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        assignmentStatus: AssignmentStatusEnum.ActiveNoPayroll,
      }),
    );

    await waitFor(() => {
      expect(result.current.inMhaIneligibleGroup).toBe(true);
    });
  });

  it('keeps user MHA-eligible when staffInfo qualifies but mhaEligibility is false (unmet IBS courses)', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({ userMhaEligibility: false }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: false,
        inMhaIneligibleGroup: false,
        inMpdGoalCalcIneligibleGroup: false,
        inPdsGoalCalcIneligibleGroup: true,
        hasNoStaffAccount: false,
        loading: false,
      });
    });
  });

  it('marks user as mha eligible when userPersonType is EmployeeStaffNonRmoSpouse', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        userPersonType: UserPersonTypeEnum.EmployeeStaffNonRmoSpouse,
      }),
    );

    await waitFor(() => {
      expect(result.current.inMhaIneligibleGroup).toBe(false);
    });
  });

  it('marks user as ASR ineligible when user and spouse are both ASR-ineligible', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        userAsrEligible: false,
        includeSpouse: true,
        spouseAsrEligible: false,
      }),
    );

    await waitFor(() => {
      expect(result.current.inAsrIneligibleGroup).toBe(true);
    });
  });

  it('marks user as ASR ineligible when there is no spouse and user is ASR-ineligible', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({ userAsrEligible: false }),
    );

    await waitFor(() => {
      expect(result.current.inAsrIneligibleGroup).toBe(true);
    });
  });

  it('falls back to the spouse for ASR eligibility when the logged-in user is not ASR-eligible', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        userAsrEligible: false,
        includeSpouse: true,
        spouseAsrEligible: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.inAsrIneligibleGroup).toBe(false);
    });
  });

  it('uses the logged-in user for salary calc even when a spouse is present', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        userSalaryRequestEligible: false,
        includeSpouse: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.inSalaryCalcIneligibleGroup).toBe(true);
    });
  });

  it('uses the logged-in user for mpd goal calc even when a spouse is present', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        userSalaryRequestEligible: false,
        includeSpouse: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
    });
  });

  it('skips the HCM query and returns defaults when skip is true', () => {
    const { result } = renderUseUsStaffGroups(buildHcmMock(), true);

    expect(result.current).toEqual({
      inAsrIneligibleGroup: false,
      inSalaryCalcIneligibleGroup: false,
      inMhaIneligibleGroup: false,
      inMpdGoalCalcIneligibleGroup: false,
      inPdsGoalCalcIneligibleGroup: true,
      hasNoStaffAccount: false,
      loading: false,
    });
  });

  it('returns eligible defaults when the HCM array is empty, with PDS hardcoded ineligible', async () => {
    const { result } = renderUseUsStaffGroups({ hcm: [] } as HcmQuery);

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: false,
        inMhaIneligibleGroup: false,
        inMpdGoalCalcIneligibleGroup: false,
        inPdsGoalCalcIneligibleGroup: true,
        hasNoStaffAccount: false,
        loading: false,
      });
    });
  });

  it('treats no staff account error as ineligible for ASR, salary calc, and MHA but keeps MPD goal calc eligible', async () => {
    const { result } = renderHook(() => useUsStaffGroups(), {
      wrapper: ({ children }: { children: ReactElement }) => (
        <GqlMockedProvider
          mocks={{
            Hcm: {
              hcm: () => {
                throw new GraphQLError('Staff account id not found', {
                  extensions: { code: 'NO_STAFF_ACCOUNT' },
                });
              },
            },
          }}
        >
          {children}
        </GqlMockedProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: true,
        inSalaryCalcIneligibleGroup: true,
        inMhaIneligibleGroup: true,
        inMpdGoalCalcIneligibleGroup: false,
        inPdsGoalCalcIneligibleGroup: true,
        hasNoStaffAccount: true,
        loading: false,
      });
    });
  });

  // TODO: follow-up PR will re-enable PDS goal calculator gating via a backend eligibility check.
  it('hardcodes the PDS goal calculator to ineligible regardless of staff data', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({
        peopleGroupSupportType: PeopleGroupSupportTypeEnum.Designation,
        userPersonType: UserPersonTypeEnum.EmployeeHourly,
      }),
    );

    await waitFor(() => {
      expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
    });
  });
});
