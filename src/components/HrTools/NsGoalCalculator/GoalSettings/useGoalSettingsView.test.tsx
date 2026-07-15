import React from 'react';
import { renderHook } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import {
  GoalSettingsViewEnum,
  parseGoalSettingsView,
  useGoalSettingsView,
} from './useGoalSettingsView';

const push = jest.fn();

describe('parseGoalSettingsView', () => {
  it('parses known values', () => {
    expect(parseGoalSettingsView('review-your-goal')).toBe(
      GoalSettingsViewEnum.ReviewYourGoal,
    );
    expect(parseGoalSettingsView('present-your-goal')).toBe(
      GoalSettingsViewEnum.PresentYourGoal,
    );
  });

  it('falls back to Goal Settings for missing or unknown values', () => {
    expect(parseGoalSettingsView(undefined)).toBe(
      GoalSettingsViewEnum.GoalSettings,
    );
    expect(parseGoalSettingsView('nonsense')).toBe(
      GoalSettingsViewEnum.GoalSettings,
    );
  });
});

describe('useGoalSettingsView', () => {
  it('reads the current view from the query param', () => {
    const { result } = renderHook(() => useGoalSettingsView(), {
      wrapper: ({ children }) => (
        <TestRouter
          router={{ query: { accountListId: 'a', view: 'present-your-goal' } }}
        >
          {children}
        </TestRouter>
      ),
    });

    expect(result.current.view).toBe(GoalSettingsViewEnum.PresentYourGoal);
  });

  it('pushes the selected view as a shallow query param', () => {
    const query = {
      accountListId: 'account-list-1',
      coachingId: 'coaching-id-1',
    };
    const { result } = renderHook(() => useGoalSettingsView(), {
      wrapper: ({ children }) => (
        <TestRouter
          router={{
            pathname:
              '/accountLists/[accountListId]/coaching/[coachingId]/nsGoalCalculator',
            query,
            push,
          }}
        >
          {children}
        </TestRouter>
      ),
    });

    result.current.setView(GoalSettingsViewEnum.ReviewYourGoal);

    expect(push).toHaveBeenCalledWith(
      {
        pathname:
          '/accountLists/[accountListId]/coaching/[coachingId]/nsGoalCalculator',
        query: {
          ...query,
          view: 'review-your-goal',
        },
      },
      undefined,
      { shallow: true },
    );
  });
});
