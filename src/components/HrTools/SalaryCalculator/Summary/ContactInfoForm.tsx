import { useMemo } from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { phoneNumber } from 'src/lib/yupHelpers';
import { AutosaveTextField } from '../Autosave/AutosaveTextField';

export const ContactInfoForm: React.FC = () => {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object({
        phoneNumber: phoneNumber(t).required(t('Phone Number is required')),
        emailAddress: yup
          .string()
          .email(t('Invalid email address'))
          .required(t('Email is required')),
      }),
    [t],
  );

  return (
    <div>
      <Typography>
        {t(
          'If the above information is correct, please confirm your current contact information and click "Submit" to process this form.',
        )}
      </Typography>
      <Stack direction="row" sx={{ mt: 3, gap: 2 }}>
        <AutosaveTextField
          label={t('Phone Number')}
          sx={{ width: '40%' }}
          fieldName="phoneNumber"
          schema={schema}
        />
        <AutosaveTextField
          label={t('Email')}
          sx={{ width: '60%' }}
          fieldName="emailAddress"
          schema={schema}
        />
      </Stack>
      <Typography variant="body2" mt={1} sx={{ fontSize: 13 }}>
        {t(
          'This email address and phone number will be used to contact you regarding this request. Changing these will not change your permanent record.',
        )}
      </Typography>
    </div>
  );
};
