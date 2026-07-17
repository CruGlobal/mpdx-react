import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NsoMpdQuestionnaireLayout } from '../Shared/NsoMpdQuestionnaireLayout';
import { NsoDetails } from './NsoDetails';

export const NsoInformation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NsoMpdQuestionnaireLayout>
      <Box mx={4} my={2}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('NSO Information')}</Typography>
          <Typography variant="body1">
            {t(
              'Tell us about your lodging while attending New Staff Orientation.',
            )}
          </Typography>
        </Stack>
        <Divider sx={{ mx: -4, my: 4 }} />
        <NsoDetails />
        <Divider sx={{ mx: -4, mt: 4 }} />
      </Box>
    </NsoMpdQuestionnaireLayout>
  );
};
