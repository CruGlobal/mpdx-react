import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AutosaveCustomTextField } from '../../../Shared/AutoSave/AutosaveCustomTextField';

interface EndingSectionProps {
  schema: yup.Schema;
}

export const EndingSection: React.FC<EndingSectionProps> = ({ schema }) => {
  const { t } = useTranslation();

  return (
    <Box mt={2}>
      <Box sx={{ mt: 3 }}>
        <Typography>
          {t(
            'If the above information is correct, please confirm your current contact information and click "Submit" to process this form.',
          )}
        </Typography>
      </Box>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'row', gap: 2 }}>
        <AutosaveCustomTextField
          label={t('Telephone Number')}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          sx={{ width: '40%' }}
          fieldName="phoneNumber"
          schema={schema}
        />
        <AutosaveCustomTextField
          label={t('Email')}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          sx={{ width: '60%' }}
          fieldName="emailAddress"
          schema={schema}
        />
      </Box>
      <Box mt={1}>
        <Typography variant="body2" sx={{ fontSize: 13 }}>
          {t(
            'This email address and phone number will be used to contact you regarding this request. Changing these will not change your permanent record.',
          )}
        </Typography>
      </Box>
    </Box>
  );
};
