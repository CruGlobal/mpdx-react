import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NsGoalCalculatorStepEnum } from '../NsGoalCalculatorHelper';

export interface NsGoalCalculatorStep {
  step: NsGoalCalculatorStepEnum;
  title: string;
}

export const useSteps = (): NsGoalCalculatorStep[] => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      {
        step: NsGoalCalculatorStepEnum.ReviewYourCalculation,
        title: t('Review Your Calculation'),
      },
      {
        step: NsGoalCalculatorStepEnum.PresentingYourGoal,
        title: t('Presenting Your Goal'),
      },
      {
        step: NsGoalCalculatorStepEnum.NextSteps,
        title: t('Next Steps'),
      },
    ],
    [t],
  );

  return steps;
};
