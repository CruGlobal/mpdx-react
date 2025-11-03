import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { RentOwnEnum } from '../../../Shared/sharedTypes';
import { FormValues } from '../../NewRequestPage';
import { DirectionButtons } from '../../Shared/DirectionButtons';

export const RentOwn: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const {
    values,
    touched,
    setTouched,
    errors,
    handleChange,
    handleBlur,
    submitCount,
    submitForm,
    isValid,
  } = useFormikContext<FormValues>();

  useEffect(() => {
    if (submitCount > 0 && !isValid) {
      setOpen(true);
    }
  }, [submitCount, isValid]);

  return (
    <>
      <Box mb={3}>
        <Typography variant="h5">{t('Rent or Own?')}</Typography>
      </Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {t('Please select the option that applies to you.')}
      </Typography>
      <Box>
        <FormControl
          component="fieldset"
          error={touched.rentOrOwn && Boolean(errors.rentOrOwn)}
        >
          <RadioGroup
            name="rentOrOwn"
            value={values.rentOrOwn}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <FormControlLabel
              value={RentOwnEnum.Rent}
              control={<Radio />}
              label={t('Rent')}
            />
            <FormControlLabel
              value={RentOwnEnum.Own}
              control={<Radio />}
              label={t('Own')}
            />
          </RadioGroup>
        </FormControl>
      </Box>
      <DirectionButtons
        handleNext={async () => {
          setTouched({ rentOrOwn: true });
          await submitForm();
        }}
      />
      {submitCount > 0 && !isValid && open && (
        <Alert
          severity="error"
          onClose={() => setOpen(false)}
          sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}
        >
          {t('Your form is missing information.')}
          <ul>{errors.rentOrOwn && <li>{errors.rentOrOwn}</li>}</ul>
        </Alert>
      )}
    </>
  );
};
