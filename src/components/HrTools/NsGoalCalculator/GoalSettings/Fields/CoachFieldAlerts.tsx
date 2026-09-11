import React from 'react';
import { ApolloError } from '@apollo/client';
import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CoachFieldAlertsProps {
  /** Set when the coach list failed to load, which must not read as "nobody is eligible". */
  listError?: ApolloError;
  onRetryCoaches: () => void;
  /** Set when a confirmed switch failed, since its confirmation has already closed. */
  assignFailed: boolean;
  removeFailed: boolean;
}

/** The coach picker's three failure surfaces, shown beneath the field. */
export const CoachFieldAlerts: React.FC<CoachFieldAlertsProps> = ({
  listError,
  onRetryCoaches,
  assignFailed,
  removeFailed,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {listError && (
        <Alert
          severity="error"
          sx={{ mt: 1 }}
          action={
            <Button color="inherit" size="small" onClick={onRetryCoaches}>
              {t('Try Again')}
            </Button>
          }
        >
          {t(
            'The list of coaches could not be loaded, so no coach can be assigned yet. Try again, and contact the help desk if it keeps failing.',
          )}
        </Alert>
      )}
      {assignFailed && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {t('The coach could not be assigned. Please try again.')}
        </Alert>
      )}
      {removeFailed && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {t('The coach could not be removed. Please try again.')}
        </Alert>
      )}
    </>
  );
};
