import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  NsGoalCalculation,
  useNsGoalCalculator,
} from '../Shared/NsGoalCalculatorContext';
import { ReviewYourCalculationContent } from './ReviewYourCalculationContent';

interface ReviewYourCalculationStepProps {
  goalCalculation: NsGoalCalculation;
}

export const ReviewYourCalculationStep: React.FC<
  ReviewYourCalculationStepProps
> = ({ goalCalculation }) => {
  const { t } = useTranslation();
  const { handleContinue } = useNsGoalCalculator();

  return (
    <ReviewYourCalculationContent
      goalCalculation={goalCalculation}
      footer={
        <Button
          variant="contained"
          onClick={handleContinue}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('Continue')}
        </Button>
      }
    />
  );
};
