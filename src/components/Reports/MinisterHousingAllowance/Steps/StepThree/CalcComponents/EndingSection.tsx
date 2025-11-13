import { Box, TextField, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { CalculationFormValues } from '../Calculation';

export const EndingSection: React.FC = () => {
  const { t } = useTranslation();
  const { values, handleChange, handleBlur, errors, touched } =
    useFormikContext<CalculationFormValues>();

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
          name="phone"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          InputLabelProps={{ shrink: true }}
          error={touched.phone && Boolean(errors.phone)}
          helperText={touched.phone && errors.phone}
          sx={{ width: '40%' }}
        />
        <TextField
          label={t('Email')}
          variant="outlined"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          InputLabelProps={{ shrink: true }}
          error={touched.email && Boolean(errors.email)}
          helperText={touched.email && errors.email}
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
