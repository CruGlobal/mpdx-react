import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StepPage } from '../Shared/StepPage';
import { SubStep } from '../Shared/SubStepList';
import { MinistryDetails } from './MinistryDetails';

export const MinistryInformation: React.FC = () => {
  const { t } = useTranslation();

  const subSteps: SubStep[] = [
    { id: 'ministry-information', title: t('Ministry Information') },
  ];

  return (
    <StepPage subSteps={subSteps}>
      <Box mx={4} my={2}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('Ministry Information')}</Typography>
          <Typography variant="body1">
            {t(
              'Tell us about the ministry assignment and location you expect to have.',
            )}
          </Typography>
          <MinistryDetails />
        </Stack>
      </Box>
    </StepPage>
  );
};
