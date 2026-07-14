import React from 'react';
import { PresentingYourGoalContent } from '../PresentingYourGoal/PresentingYourGoalContent';
import { GoalSettingsFormProps } from './GoalSettingsForm';
import { useNewStaffGoalCalculation } from './useNewStaffGoalCalculation';

/**
 * Coaching/admin-side "Presenting Your Goal" content. Loads the saved
 * calculation (an account-list goal or a scenario goal) and renders the shared
 * goal presentation.
 */
export const GoalSettingsPresentContent: React.FC<GoalSettingsFormProps> = (
  props,
) => {
  const { goalCalculation, fallback } = useNewStaffGoalCalculation(props);

  if (!goalCalculation) {
    return fallback;
  }

  return <PresentingYourGoalContent goalCalculation={goalCalculation} />;
};
