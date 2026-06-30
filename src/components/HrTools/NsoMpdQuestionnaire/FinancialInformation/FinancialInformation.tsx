import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StepPage } from '../Shared/StepPage';
import { SubStep } from '../Shared/SubStepList';
import { DebtQuestions } from './DebtQuestions';
import { VariantQuestions } from './VariantQuestions';

export const FinancialInformation: React.FC = () => {
  const { t } = useTranslation();

  const subSteps: SubStep[] = [
    { id: 'financial-information', title: t('Financial Information') },
  ];

  return (
    <StepPage subSteps={subSteps}>
      <Box mx={4} my={2}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('Financial Information')}</Typography>
          <Typography variant="body1">
            {t('Tell us about your financial situation.')}
          </Typography>
          <Stack spacing={4}>
            <VariantQuestions />
            <DebtQuestions />
          </Stack>
        </Stack>
      </Box>
    </StepPage>
  );
};
