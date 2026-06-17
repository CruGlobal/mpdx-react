import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StepPage } from '../Shared/StepPage';
import { SubStep } from '../Shared/SubStepList';
import { NsoDetails } from './NsoDetails';

export const NsoInformation: React.FC = () => {
  const { t } = useTranslation();

  const subSteps: SubStep[] = [
    { id: 'nso-information', title: t('NSO Information') },
  ];

  return (
    <StepPage subSteps={subSteps}>
      <Box mx={4} my={2}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('NSO Information')}</Typography>
          <Typography variant="body1">
            {t(
              'Tell us about your lodging while attending New Staff Orientation.',
            )}
          </Typography>
          <NsoDetails />
        </Stack>
      </Box>
    </StepPage>
  );
};
