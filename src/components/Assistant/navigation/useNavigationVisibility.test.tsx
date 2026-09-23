import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { LoadCoachingListQuery } from 'src/components/Coaching/LoadCoachingList.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import { useNavigationVisibility } from './useNavigationVisibility';

interface Mocks {
  GetUser: GetUserQuery;
  UserOption: UserOptionQuery;
  LoadCoachingList: LoadCoachingListQuery;
}

const staffUser = {
  userType: UserTypeEnum.UsStaff,
  usStaffGroup: UsStaffGroupEnum.SeniorStaff,
  spouseUsStaffGroup: UsStaffGroupEnum.SeniorStaff,
  staffAccountId: 'staff-account-1',
};

const nonCruUser = {
  userType: UserTypeEnum.NonCru,
  usStaffGroup: null,
  spouseUsStaffGroup: null,
  staffAccountId: null,
};

const makeWrapper = (
  user: typeof staffUser | typeof nonCruUser,
  coachingCount: number,
) => {
  const Wrapper = ({ children }: { children: React.ReactElement }) => (
    <GqlMockedProvider<Mocks>
      mocks={{
        GetUser: { user },
        UserOption: {
          userOption: { key: 'user_type_verified', value: 'true' },
        },
        LoadCoachingList: {
          coachingAccountLists: { nodes: [], totalCount: coachingCount },
        },
      }}
    >
      {children}
    </GqlMockedProvider>
  );
  return Wrapper;
};

describe('useNavigationVisibility', () => {
  beforeEach(() => {
    mockSession({ developer: false });
  });

  afterEach(() => {
    process.env.DISABLE_NEW_REPORTS = 'false';
  });

  it('shows everything a verified US staff coach can see', async () => {
    const { result } = renderHook(() => useNavigationVisibility(), {
      wrapper: makeWrapper(staffUser, 2),
    });

    await waitFor(() =>
      expect(result.current).toEqual({
        hr_tools: true,
        coaching: true,
        reports: true,
        staff_features: true,
      }),
    );
  });

  it('hides HR Tools, coaching, and staff reports from a non-Cru user who coaches no one', async () => {
    const { result } = renderHook(() => useNavigationVisibility(), {
      wrapper: makeWrapper(nonCruUser, 0),
    });

    await waitFor(() =>
      expect(result.current).toEqual({
        hr_tools: false,
        coaching: false,
        reports: true,
        staff_features: false,
      }),
    );
  });

  it('hides the staff reports when DISABLE_NEW_REPORTS is on', async () => {
    process.env.DISABLE_NEW_REPORTS = 'true';
    const { result } = renderHook(() => useNavigationVisibility(), {
      wrapper: makeWrapper(staffUser, 2),
    });

    await waitFor(() =>
      expect(result.current).toEqual({
        hr_tools: true,
        coaching: true,
        reports: true,
        staff_features: false,
      }),
    );
  });
});
