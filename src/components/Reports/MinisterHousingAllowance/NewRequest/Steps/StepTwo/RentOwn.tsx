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
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import i18n from 'src/lib/i18n';
import { RentOwnEnum } from '../../../Shared/sharedTypes';
import { DirectionButtons } from '../../Shared/DirectionButtons';

export interface FormValues {
  rentOrOwn: RentOwnEnum | string;
}

interface RentOwnProps {
  handleNext: () => void;
}

const validationSchema = yup.object({
  rentOrOwn: yup
    .string()
    .required(i18n.t('Please select one of the options above to continue.')),
});

export const RentOwn: React.FC<RentOwnProps> = ({ handleNext }) => {
  const { t } = useTranslation();
  const initialValues: FormValues = {
    rentOrOwn: '',
  };

  const [open, setOpen] = useState(true);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={() => {
        handleNext();
      }}
    >
      {({
        values: { rentOrOwn },
        touched,
        setTouched,
        errors,
        handleChange,
        handleBlur,
        submitCount,
        submitForm,
        isValid,
      }) => {
        useEffect(() => {
          if (submitCount > 0 && !isValid) {
            setOpen(true);
          }
        }, [submitCount, isValid]);

        return (
          <form>
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
                  value={rentOrOwn}
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
          </form>
        );
      }}
    </Formik>
  );
};
