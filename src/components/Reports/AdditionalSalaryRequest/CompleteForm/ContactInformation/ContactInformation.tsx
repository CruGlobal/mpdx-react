import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AutosaveCustomTextField } from '../../Shared/AutoSave/AutosaveCustomTextField';

export const ContactInformation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          width: '100%',
        }}
      >
        <AutosaveCustomTextField
          fullWidth
          variant="outlined"
          fieldName="phoneNumber"
          label={t('Telephone Number')}
          placeholder={t('Enter telephone number')}
          sx={{ flex: '0 0 35%' }}
        />

        <AutosaveCustomTextField
          fullWidth
          variant="outlined"
          fieldName="emailAddress"
          label={t('Email Address')}
          placeholder={t('Enter email address')}
          sx={{ flex: '1 1 65%' }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          mt: 2,
        }}
      >
        {t(
          'This email address and phone number will be used to contact you regarding this request. Changing these will not change your permanent record.',
        )}
      </Typography>
    </Box>
  );
};
