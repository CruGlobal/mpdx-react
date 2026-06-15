import React, { useMemo } from 'react';
import Phone from '@mui/icons-material/Phone';
import { InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { phoneNumber, sanitizePhoneNumber } from 'src/lib/yupHelpers';
import { useQuestionnaireAutoSave } from '../Shared/useQuestionnaireAutoSave';

const placeholder = '000-000-0000';

export const ContactInformation: React.FC = () => {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object({
        cellPhone: phoneNumber(t).required(t('Cell phone number is required')),
      }),
    [t],
  );

  const fieldProps = useQuestionnaireAutoSave({
    fieldName: 'cellPhone',
    schema,
  });

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t('Contact Information')}</Typography>
      <Typography>{t('Please provide your cell phone number.')}</Typography>
      <TextField
        label={t('Cell Phone Number')}
        placeholder={placeholder}
        size="small"
        sx={{ maxWidth: (theme) => theme.spacing(40) }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone />
            </InputAdornment>
          ),
        }}
        {...fieldProps}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          event.target.value = sanitizePhoneNumber(event.target.value);
          fieldProps.onChange(event);
        }}
        onBlur={() => {
          fieldProps.onBlur();
        }}
      />
    </Stack>
  );
};
