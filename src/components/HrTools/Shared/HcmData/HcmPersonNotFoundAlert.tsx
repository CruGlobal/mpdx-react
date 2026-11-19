import React from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface HcmPersonNotFoundAlertProps {
  /** Set when a supervisor is viewing someone else's report */
  isSupervisorView?: boolean;
}

/** Explains a report that loaded without HCM, so its salary is not split by person. */
export const HcmPersonNotFoundAlert: React.FC<HcmPersonNotFoundAlertProps> = ({
  isSupervisorView,
}) => {
  const { t } = useTranslation();

  return (
    <Alert severity="info" role="status" sx={{ mb: 3 }}>
      {isSupervisorView
        ? t(
            "HR no longer has a record for this person, so salary isn't split by person on this report.",
          )
        : t(
            "HR no longer has a record for you, so salary isn't split by person on this report.",
          )}
    </Alert>
  );
};
