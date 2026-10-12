import React from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const LocationInfoAlert: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Alert severity="info" sx={{ mt: 1 }}>
      {t(
        'This will update your default location multiplier in your account settings.',
      )}
    </Alert>
  );
};
