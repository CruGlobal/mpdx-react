import React, { useState } from 'react';
import { ApolloError } from '@apollo/client';
import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Sent by the API when the HCM UserInfo service is down or overloaded */
export const HCM_UNAVAILABLE_CODE = 'HCM_UNAVAILABLE';

export const isHcmUnavailableError = (
  error: ApolloError | undefined,
): boolean =>
  !!error?.graphQLErrors.some(
    ({ extensions }) => extensions?.code === HCM_UNAVAILABLE_CODE,
  );

interface HcmUnavailableAlertProps {
  /** Refetches the HCM query */
  refetch: () => Promise<unknown>;
}

export const HcmUnavailableAlert: React.FC<HcmUnavailableAlertProps> = ({
  refetch,
}) => {
  const { t } = useTranslation();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    refetch()
      .catch(() => {})
      .finally(() => setRetrying(false));
  };

  return (
    <Alert
      severity="error"
      action={
        <Button
          color="inherit"
          size="small"
          onClick={handleRetry}
          disabled={retrying}
        >
          {t('Try Again')}
        </Button>
      }
    >
      {t(
        'The system is currently under heavy load. Please try again in a few minutes.',
      )}
    </Alert>
  );
};
