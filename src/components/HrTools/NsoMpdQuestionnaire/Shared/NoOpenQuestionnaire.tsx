import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Shown when the query returns no questionnaire, in progress or submitted. A questionnaire is
 * created by the OneApp import (never by this frontend), so there is no form to render. Surface an
 * informational message instead of a blank, unsaveable form.
 */
export const NoOpenQuestionnaire: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box m={4}>
      <Alert severity="info">
        <AlertTitle>{t('No open questionnaire')}</AlertTitle>
        {t(
          "You don't have a questionnaire to complete right now. If you think this is a mistake, contact your ministry HR/onboarding team.",
        )}
      </Alert>
    </Box>
  );
};
