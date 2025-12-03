import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';

interface ContactInformationProps {
  // TODO once we have users email make this argument required and remove default argument
  email?: string;
}

export const ContactInformation: React.FC<ContactInformationProps> = ({
  email = '',
}) => {
  const { t } = useTranslation();

  const { values, handleChange, handleBlur, errors, touched } =
    useFormikContext<CompleteFormValues>();

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          width: '100%',
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          name="telephoneNumber"
          type="tel"
          label={t('Telephone Number')}
          value={values.telephoneNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.telephoneNumber && Boolean(errors.telephoneNumber)}
          helperText={touched.telephoneNumber && errors.telephoneNumber}
          placeholder={t('Enter telephone number')}
          sx={{ flex: '0 0 35%' }}
        />
        <Box sx={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              mb: 1,
            }}
          >
            {t('Email Address')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              minHeight: '1.5rem',
              pb: 1,
            }}
          >
            {email || t('email address')}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="body2"
        sx={{
          mt: 0.5,
        }}
      >
        {t(
          'This email address and phone number will be used to contact you regarding this request. Changing these will not change your permanent record.',
        )}
      </Typography>
    </Box>
  );
};
