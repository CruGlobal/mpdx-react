import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StepPage } from '../Shared/StepPage';
import { SubStep } from '../Shared/SubStepList';

export const Summary: React.FC = () => {
  const { t } = useTranslation();

  const subSteps: SubStep[] = [{ id: 'summary', title: t('Summary') }];

  return (
    <StepPage subSteps={subSteps}>
      <Box mx={4} my={2}>
        <Typography variant="body1" color="textSecondary">
          {t('This step is coming soon.')}
        </Typography>
      </Box>
    </StepPage>
  );
};
