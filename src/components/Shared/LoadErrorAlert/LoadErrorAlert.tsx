import React from 'react';
import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface LoadErrorAlertProps {
  message: string;
  onRetry: () => void;
}

export const LoadErrorAlert: React.FC<LoadErrorAlertProps> = ({
  message,
  onRetry,
}) => {
  const { t } = useTranslation();

  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          {t('Try Again')}
        </Button>
      }
    >
      {message}
    </Alert>
  );
};
