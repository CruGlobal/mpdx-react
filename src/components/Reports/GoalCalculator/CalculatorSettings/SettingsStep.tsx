import React from 'react';
import { Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { Step } from '../SharedComponents/Step/Step';
import { InformationCategory } from './Categories/InformationCategory/InformationCategory';

const InstructionsWrapper = styled('div')(({ theme }) => ({
  '.MuiTypography-root': {
    marginBottom: theme.spacing(1),
  },
}));

const Instructions: React.FC = () => {
  const { t } = useTranslation();

  return (
    <InstructionsWrapper>
      <Typography variant="h6">{t('Information')}</Typography>
      <Typography variant="body2">
        {t('Take a moment to verify your information.')}
      </Typography>
    </InstructionsWrapper>
  );
};

export const SettingsStep: React.FC = () => {
  const { goalCalculationResult } = useGoalCalculator();
  const { data } = goalCalculationResult;

  return (
    <Step
      instructions={<Instructions />}
      additionalComponent={<InformationCategory />}
      family={data?.goalCalculation.specialFamily}
    />
  );
};
