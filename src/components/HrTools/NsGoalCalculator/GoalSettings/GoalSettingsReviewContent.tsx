import React from 'react';
import { ReviewYourCalculationContent } from '../ReviewYourCalculation/ReviewYourCalculationContent';
import { GoalSettingsFormProps } from './GoalSettingsForm';
import { useNewStaffGoalCalculation } from './useNewStaffGoalCalculation';

/**
 * Coaching/admin-side "Review Your Goal" content. Loads the saved calculation
 * (an account-list goal or a scenario goal) and renders the shared calculation
 * review.
 */
export const GoalSettingsReviewContent: React.FC<GoalSettingsFormProps> = (
  props,
) => {
  const { goalCalculation, fallback } = useNewStaffGoalCalculation(props);

  if (!goalCalculation) {
    return fallback;
  }

  return <ReviewYourCalculationContent goalCalculation={goalCalculation} />;
};
