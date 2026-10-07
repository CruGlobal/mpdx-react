import React, { useState } from 'react';
import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useUpdateUserOptionMutation,
  useUserOptionQuery,
} from 'src/hooks/UserPreference.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { SetLocationModal } from './SetLocationModal';

const locationSetFromAsrKey = 'location_set_from_asr';

export const MissingLocationAlert: React.FC = () => {
  const { t } = useTranslation();
  const { calculations, user } = useAdditionalSalaryRequest();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: optionData, loading } = useUserOptionQuery({
    variables: { key: locationSetFromAsrKey },
  });
  const [updateUserOption] = useUpdateUserOptionMutation();
  const locationSetFromAsr = optionData?.userOption?.value === 'true';

  const setLocationSetFromAsr = () =>
    updateUserOption({
      variables: { key: locationSetFromAsrKey, value: 'true' },
      optimisticResponse: {
        createOrUpdateUserOption: {
          option: {
            __typename: 'Option',
            key: locationSetFromAsrKey,
            value: 'true',
          },
        },
      },
    });

  if (
    !calculations ||
    calculations.geographicLocation ||
    (loading && !optionData)
  ) {
    return null;
  }

  if (locationSetFromAsr) {
    return (
      <Alert severity="warning">
        {t(
          "Your cap may be inaccurate because your location isn't set. You've already used your one-time location update, so please submit a new Salary Calculation Form to set your location.",
        )}
      </Alert>
    );
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
        <SetLocationModal
          handleClose={() => setModalOpen(false)}
          onSaved={setLocationSetFromAsr}
        />
      )}
    </>
  );
};
