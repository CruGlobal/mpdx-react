import { Box, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { mocks } from 'src/components/Reports/MinisterHousingAllowance/Shared/mockData';

export const EndingSection: React.FC = () => {
  const { t } = useTranslation();

  //TODO: add validation to text fields

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
        <TextField
          label={t('Telephone Number')}
          variant="outlined"
          value={mocks[0].staffInfo.phone}
          InputLabelProps={{ shrink: true }}
          sx={{ width: '40%' }}
        />
        <TextField
          label={t('Email')}
          variant="outlined"
          value={mocks[0].staffInfo.email}
          InputLabelProps={{ shrink: true }}
          sx={{ width: '60%' }}
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
