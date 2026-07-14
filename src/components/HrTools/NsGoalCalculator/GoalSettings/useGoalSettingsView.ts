import { useRouter } from 'next/router';
import { getQueryParam } from 'src/lib/queryParam';

export enum GoalSettingsViewEnum {
  GoalSettings = 'goal-settings',
  ReviewYourGoal = 'review-your-goal',
  PresentYourGoal = 'present-your-goal',
}

export const parseGoalSettingsView = (
  value: string | undefined,
): GoalSettingsViewEnum => {
  switch (value) {
    case GoalSettingsViewEnum.ReviewYourGoal:
      return GoalSettingsViewEnum.ReviewYourGoal;
    case GoalSettingsViewEnum.PresentYourGoal:
      return GoalSettingsViewEnum.PresentYourGoal;
    default:
      return GoalSettingsViewEnum.GoalSettings;
  }
};

export const useGoalSettingsView = (): {
  view: GoalSettingsViewEnum;
  setView: (view: GoalSettingsViewEnum) => void;
} => {
  const router = useRouter();
  const view = parseGoalSettingsView(getQueryParam(router.query, 'view'));

  const setView = (next: GoalSettingsViewEnum): void => {
    router.push(
      { pathname: router.pathname, query: { ...router.query, view: next } },
      undefined,
      { shallow: true },
    );
  };

  return { view, setView };
};
