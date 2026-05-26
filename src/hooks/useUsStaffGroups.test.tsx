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

  it('marks user as salary-calc ineligible when salaryRequestEligible is false', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({ userSalaryRequestEligible: false }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: true,
        inMhaIneligibleGroup: false,
        inMpdGoalCalcIneligibleGroup: false,
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

  it('skips the HCM query and returns defaults when skip is true', () => {
    const { result } = renderUseUsStaffGroups(buildHcmMock(), true);

    expect(result.current).toEqual({
      inAsrIneligibleGroup: false,
      inSalaryCalcIneligibleGroup: false,
      inMhaIneligibleGroup: false,
      inMpdGoalCalcIneligibleGroup: true,
      inPdsGoalCalcIneligibleGroup: true,
      hasNoStaffAccount: false,
      loading: false,
    });
  });

  it('fails closed on goal calculators when array is empty', async () => {
    const { result } = renderUseUsStaffGroups({ hcm: [] } as HcmQuery);

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: false,
        inMhaIneligibleGroup: false,
        inMpdGoalCalcIneligibleGroup: true,
        inPdsGoalCalcIneligibleGroup: true,
        hasNoStaffAccount: false,
        loading: false,
      });
    });
  });

  it('treats no staff account error as ineligible for all groups', async () => {
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
        inMpdGoalCalcIneligibleGroup: true,
        inPdsGoalCalcIneligibleGroup: true,
        hasNoStaffAccount: true,
        loading: false,
      });
    });
  });

  describe('Goal Calculator eligibility', () => {
    it('marks user as PDS goal calc ineligible and MPD goal calc eligible when peopleGroupSupportType is SupportedRmo', async () => {
      const { result } = renderUseUsStaffGroups(
        buildHcmMock({
          peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
        }),
      );

      await waitFor(() => {
        expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(false);
        expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
      });
    });

    it('marks user as MPD goal calc ineligible and PDS goal calc eligible when peopleGroupSupportType is Designation', async () => {
      const { result } = renderUseUsStaffGroups(
        buildHcmMock({
          peopleGroupSupportType: PeopleGroupSupportTypeEnum.Designation,
        }),
      );

      await waitFor(() => {
        expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
        expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(false);
      });
    });

    it('marks user as ineligible for both goal calcs when peopleGroupSupportType is SupportedNonRmo', async () => {
      const { result } = renderUseUsStaffGroups(
        buildHcmMock({
          peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedNonRmo,
        }),
      );

      await waitFor(() => {
        expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
        expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
      });
    });

    it('marks user as ineligible for both goal calcs when peopleGroupSupportType is None', async () => {
      const { result } = renderUseUsStaffGroups(
        buildHcmMock({
          peopleGroupSupportType: PeopleGroupSupportTypeEnum.None,
        }),
      );

      await waitFor(() => {
        expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
        expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
      });
    });

    it('fails closed when peopleGroupSupportType is null', async () => {
      const { result } = renderHook(() => useUsStaffGroups(), {
        wrapper: ({ children }: { children: ReactElement }) => (
          <GqlMockedProvider<{ Hcm: HcmQuery }>
            mocks={{
              Hcm: {
                hcm: [
                  {
                    asrEit: { asrEligibility: true },
                    salaryRequestEligible: true,
                    mhaEit: { mhaEligibility: true },
                    staffInfo: {
                      userPersonType: UserPersonTypeEnum.EmployeeStaff,
                      peopleGroupSupportType: null,
                      assignmentStatus:
                        AssignmentStatusEnum.ActivePayrollEligible,
                    },
                  },
                ],
              } as HcmQuery,
            }}
          >
            {children}
          </GqlMockedProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
        expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
      });
    });

    it('uses the logged-in user for goal calc eligibility even when a spouse is present with a different support type', async () => {
      const { result } = renderUseUsStaffGroups(
        buildHcmMock({
          peopleGroupSupportType: PeopleGroupSupportTypeEnum.Designation,
          includeSpouse: true,
        }),
      );

      await waitFor(() => {
        expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
        expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(false);
      });
    });
  });
});
