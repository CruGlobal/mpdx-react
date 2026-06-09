import React from 'react';
import { NextStepsStep } from './NextSteps/NextStepsStep';
import { NsGoalCalculatorStepEnum } from './NsGoalCalculatorHelper';
import { PresentingYourGoalStep } from './PresentingYourGoal/PresentingYourGoalStep';
import { ReviewYourCalculationStep } from './ReviewYourCalculation/ReviewYourCalculationStep';
import { useNsGoalCalculator } from './Shared/NsGoalCalculatorContext';

export const NsGoalCalculator: React.FC = () => {
  const { currentStep } = useNsGoalCalculator();

  switch (currentStep.step) {
    case NsGoalCalculatorStepEnum.ReviewYourCalculation:
      return <ReviewYourCalculationStep />;
    case NsGoalCalculatorStepEnum.PresentingYourGoal:
      return <PresentingYourGoalStep />;
    case NsGoalCalculatorStepEnum.NextSteps:
      return <NextStepsStep />;
  }
};
