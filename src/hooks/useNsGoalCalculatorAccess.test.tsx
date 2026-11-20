import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import { useNsGoalCalculatorAccess } from './useNsGoalCalculatorAccess';

interface WrapperOptions {
  usStaffGroup?: UsStaffGroupEnum;
  userGroupVerified?: boolean;
}

const makeWrapper = ({
  usStaffGroup = UsStaffGroupEnum.NewStaff,
  userGroupVerified = true,
}: WrapperOptions = {}) => {
  const Wrapper: React.FC<{ children: React.ReactElement }> = ({
    children,
  }) => (
    <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
      mocks={{
        GetUser: { user: { usStaffGroup } },
        UserOption: {
          userOption: {
            key: 'user_type_verified',
            value: userGroupVerified ? 'true' : 'false',
          },
        },
      }}
    >
      {children}
    </GqlMockedProvider>
  );
  return Wrapper;
};

describe('useNsGoalCalculatorAccess', () => {
  const originalFlag = process.env.DISABLE_NS_GOAL_CALCULATOR;

  afterEach(() => {
    process.env.DISABLE_NS_GOAL_CALCULATOR = originalFlag;
  });

  it('is denied until the user has loaded', () => {
    const { result } = renderHook(() => useNsGoalCalculatorAccess(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.canUseNsGoalCalculator).toBe(false);
  });

  it('allows verified new staff', async () => {
    const { result } = renderHook(() => useNsGoalCalculatorAccess(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() =>
      expect(result.current.canUseNsGoalCalculator).toBe(true),
    );
  });

  it('denies staff outside the new staff group', async () => {
    const { result } = renderHook(() => useNsGoalCalculatorAccess(), {
      wrapper: makeWrapper({ usStaffGroup: UsStaffGroupEnum.SeniorStaff }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canUseNsGoalCalculator).toBe(false);
  });

  it('denies new staff whose user group is unverified', async () => {
    const { result } = renderHook(() => useNsGoalCalculatorAccess(), {
      wrapper: makeWrapper({ userGroupVerified: false }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canUseNsGoalCalculator).toBe(false);
  });

  it('denies everyone while the feature flag is off', async () => {
    process.env.DISABLE_NS_GOAL_CALCULATOR = 'true';
    const { result } = renderHook(() => useNsGoalCalculatorAccess(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canUseNsGoalCalculator).toBe(false);
  });
});
