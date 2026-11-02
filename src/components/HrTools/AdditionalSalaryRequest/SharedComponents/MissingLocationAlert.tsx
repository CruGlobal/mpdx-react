import React, { useState } from 'react';
import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { SetLocationModal } from './SetLocationModal';

export const MissingLocationAlert: React.FC = () => {
  const { t } = useTranslation();
  const { calculations, user, hcmLoading } = useAdditionalSalaryRequest();
  const [modalOpen, setModalOpen] = useState(false);

  if (!calculations || calculations.geographicLocation || hcmLoading) {
    return null;
  }

  const hcmLocation = [user?.staffInfo.city, user?.staffInfo.state]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <Alert
        severity="warning"
        sx={{
          '& .MuiAlert-action': {
            alignItems: 'center',
            paddingTop: 0,
          },
        }}
        action={
          <Button
            color="inherit"
            size="small"
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() => setModalOpen(true)}
          >
            {t('Set Location')}
          </Button>
        }
      >
        {t("Your cap may be inaccurate because your location isn't set.")}{' '}
        {hcmLocation &&
          t(
            'We see that you live in {{location}}. Please set your location so your cap is accurate.',
            { location: hcmLocation },
          )}
      </Alert>
      {modalOpen && (
        <SetLocationModal handleClose={() => setModalOpen(false)} />
      )}
    </>
  );
};
