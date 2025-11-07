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
import { PageEnum, RentOwnEnum } from '../../../Shared/sharedTypes';
import { FormValues } from '../../NewRequestPage';
import { DirectionButtons } from '../../Shared/DirectionButtons';

interface RentOwnProps {
  type: PageEnum;
}

export const RentOwn: React.FC<RentOwnProps> = ({ type }) => {
  const { t } = useTranslation();

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

  return (
    <>
      <Box mb={3}>
        <Typography variant="h5">{t('Rent or Own?')}</Typography>
      </Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {t('Please select the option that applies to you.')}
        {type === PageEnum.Edit &&
          t(
            ' If this has changed from your previous submission, you may need to provide additional information on the next screen.',
          )}
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
        type={type}
        handleNext={async () => {
          setTouched({ rentOrOwn: true });
          await submitForm();
        }}
      />
      {submitCount > 0 && !isValid && (
        <Alert severity="error" sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}>
          {t('Your form is missing information.')}
          <ul>{errors.rentOrOwn && <li>{errors.rentOrOwn}</li>}</ul>
        </Alert>
      )}
    </>
  );
};
