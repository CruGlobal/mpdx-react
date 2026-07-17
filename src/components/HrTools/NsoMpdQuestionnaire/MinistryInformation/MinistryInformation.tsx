import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NsoMpdQuestionnaireLayout } from '../Shared/NsoMpdQuestionnaireLayout';
import { MinistryDetails } from './MinistryDetails';

export const MinistryInformation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NsoMpdQuestionnaireLayout>
      <Box mx={4} my={2}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('Ministry Information')}</Typography>
          <Typography variant="body1">
            {t(
              'Tell us about the ministry assignment and location you expect to have.',
            )}
          </Typography>
        </Stack>
        <Divider sx={{ mx: -4, my: 4 }} />
        <MinistryDetails />
        <Divider sx={{ mx: -4, mt: 4 }} />
      </Box>
    </NsoMpdQuestionnaireLayout>
  );
};
