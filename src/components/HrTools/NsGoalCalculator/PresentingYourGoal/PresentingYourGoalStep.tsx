import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  NsGoalCalculation,
  useNsGoalCalculator,
} from '../Shared/NsGoalCalculatorContext';
import { PresentingYourGoalContent } from './PresentingYourGoalContent';

interface PresentingYourGoalStepProps {
  goalCalculation: NsGoalCalculation;
}

export const PresentingYourGoalStep: React.FC<PresentingYourGoalStepProps> = ({
  goalCalculation,
}) => {
  const { t } = useTranslation();
  const { handleContinue } = useNsGoalCalculator();

  return (
    <PresentingYourGoalContent
      goalCalculation={goalCalculation}
      footer={
        <Button
          variant="contained"
          onClick={handleContinue}
          className="print-hidden"
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('Continue')}
        </Button>
      }
    />
  );
};
