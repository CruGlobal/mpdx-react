import React, { ReactElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HcmQuery } from 'src/components/Reports/Shared/HcmData/Hcm.generated';
import { useUsStaffGroups } from './useUsStaffGroups';

interface BuildHcmMockOptions {
  userAsrEligible?: boolean;
  userSalaryRequestEligible?: boolean;
  userMhaEligible?: boolean;
  includeSpouse?: boolean;
  spouseAsrEligible?: boolean;
}

const buildHcmMock = ({
  userAsrEligible = true,
  userSalaryRequestEligible = true,
  userMhaEligible = true,
  includeSpouse = false,
  spouseAsrEligible = true,
}: BuildHcmMockOptions = {}): HcmQuery => {
  const entries = [
    {
      asrEit: { asrEligibility: userAsrEligible },
      salaryRequestEligible: userSalaryRequestEligible,
      mhaEit: { mhaEligibility: userMhaEligible },
    },
  ];
  if (includeSpouse) {
    entries.push({
      asrEit: { asrEligibility: spouseAsrEligible },
      salaryRequestEligible: true,
      mhaEit: { mhaEligibility: true },
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
        loading: false,
      });
    });
  });

  it('marks user as mha ineligible when mhaEligibility is false', async () => {
    const { result } = renderUseUsStaffGroups(
      buildHcmMock({ userMhaEligible: false }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        inAsrIneligibleGroup: false,
        inSalaryCalcIneligibleGroup: false,
        inMhaIneligibleGroup: true,
        loading: false,
      });
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
      loading: false,
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
        loading: false,
      });
    });
  });
});
