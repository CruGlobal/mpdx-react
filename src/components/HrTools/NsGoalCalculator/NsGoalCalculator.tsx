import React from 'react';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useNewStaffGoalCalculation } from './GoalSettings/useNewStaffGoalCalculation';
import { NextStepsStep } from './NextSteps/NextStepsStep';
import { NsGoalCalculatorStepEnum } from './NsGoalCalculatorHelper';
import { PresentingYourGoalStep } from './PresentingYourGoal/PresentingYourGoalStep';
import { ReviewYourCalculationStep } from './ReviewYourCalculation/ReviewYourCalculationStep';
import { useNsGoalCalculator } from './Shared/NsGoalCalculatorContext';

export const NsGoalCalculator: React.FC = () => {
  const { currentStep } = useNsGoalCalculator();
  const accountListId = useAccountListId();

  const { goalCalculation, fallback } = useNewStaffGoalCalculation({
    accountListId,
  });

  if (!goalCalculation) {
    return fallback;
  }

  switch (currentStep.step) {
    case NsGoalCalculatorStepEnum.ReviewYourCalculation:
      return <ReviewYourCalculationStep goalCalculation={goalCalculation} />;
    case NsGoalCalculatorStepEnum.PresentingYourGoal:
      return <PresentingYourGoalStep goalCalculation={goalCalculation} />;
    case NsGoalCalculatorStepEnum.NextSteps:
      return <NextStepsStep />;
  }
};
