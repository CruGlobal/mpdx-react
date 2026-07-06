import React from 'react';
import { Alert, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useNewStaffGoalCalculationQuery } from './GoalSettings/NewStaffGoalCalculation.generated';
import { NextStepsStep } from './NextSteps/NextStepsStep';
import { NsGoalCalculatorStepEnum } from './NsGoalCalculatorHelper';
import { PresentingYourGoalStep } from './PresentingYourGoal/PresentingYourGoalStep';
import { ReviewYourCalculationStep } from './ReviewYourCalculation/ReviewYourCalculationStep';
import { useNsGoalCalculator } from './Shared/NsGoalCalculatorContext';

export const NsGoalCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { currentStep } = useNsGoalCalculator();
  const accountListId = useAccountListId();

  const { data, loading, error } = useNewStaffGoalCalculationQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });
  const goalCalculation = data?.newStaffGoalCalculation ?? null;

  if (loading) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!goalCalculation) {
    return (
      <Alert severity="info">
        {t('No new staff goal calculation exists for this account.')}
      </Alert>
    );
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
