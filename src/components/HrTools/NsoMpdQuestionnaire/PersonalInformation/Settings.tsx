import React from 'react';
import { Alert, AlertTitle, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

/**
 * Informational subsection of the Personal Information step. Display-only guidance for the user
 * before they answer — not a sidebar sub-step.
 */
export const Settings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t('Settings')}</Typography>
      <Alert severity="info">
        <AlertTitle>
          {t('Please read all information before answering.')}
        </AlertTitle>
        <Trans t={t}>
          One of the most common causes of errors in MPD goals is from people
          claiming too many years on staff. The system will always show 0 unless
          you have already been through an NSO training and are on staff or have
          been previously. Intern, STINT, and Part-time years{' '}
          <strong>do not</strong> count towards this number.
        </Trans>
      </Alert>
    </Stack>
  );
};
