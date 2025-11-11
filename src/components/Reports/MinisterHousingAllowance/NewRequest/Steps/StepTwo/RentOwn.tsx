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
import { useMinisterHousingAllowance } from '../../../Shared/MinisterHousingAllowanceContext';
import { PageEnum, RentOwnEnum } from '../../../Shared/sharedTypes';
import { ConfirmationModal } from '../../ConfirmationModal/ConfirmationModal';
import { FormValues } from '../../NewRequestPage';
import { DirectionButtons } from '../../Shared/DirectionButtons';
import { CalculationFormValues } from '../StepThree/Calculation';

//TODO: test conformation modal when calc values change

export const RentOwn: React.FC = () => {
  const { t } = useTranslation();

  const {
    values,
    touched,
    setTouched,
    errors,
    handleChange,
    handleBlur,
    submitForm,
    setFieldValue,
  } = useFormikContext<FormValues>();

  const { values: calculationValues } =
    useFormikContext<CalculationFormValues>();
  const hasCalcValues = Object.values(calculationValues).some(
    (value) => value !== undefined && value !== null && value !== '',
  );

  const { pageType } = useMinisterHousingAllowance();

  const [pendingValue, setPendingValue] = useState<RentOwnEnum | null>(null);
  const [displayValue, setDisplayValue] = useState<RentOwnEnum | null>(null);
  const [isRequestingChange, setIsRequestingChange] = useState(false);

  useEffect(() => {
    setDisplayValue(values.rentOrOwn ?? null);
  }, [values.rentOrOwn]);

  const handleNext = async () => {
    setTouched({ rentOrOwn: true });
    await submitForm();
  };

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (hasCalcValues) {
      const selectedValue = event.target.value as RentOwnEnum;
      const previous = values.rentOrOwn;

      if (previous && previous !== selectedValue) {
        setPendingValue(selectedValue);
        setIsRequestingChange(true);
      } else {
        setFieldValue('rentOrOwn', selectedValue);
        setDisplayValue(selectedValue);
      }
    } else {
      handleChange(event);
    }
  };

  const handleClose = () => {
    setIsRequestingChange(false);
    setPendingValue(null);
  };

  const handleConfirm = () => {
    if (pendingValue) {
      setFieldValue('rentOrOwn', pendingValue);
      setDisplayValue(pendingValue);
    }
    setIsRequestingChange(false);
    setPendingValue(null);
  };

  return (
    <>
      <Box mb={3}>
        <Typography variant="h5">{t('Rent or Own?')}</Typography>
      </Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {t('Please select the option that applies to you.')}
        {pageType === PageEnum.Edit &&
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
            value={displayValue}
            onChange={handleCustomChange}
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
        {isRequestingChange && (
          <ConfirmationModal
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            isRequestingChange={true}
          />
        )}
      </Box>
      <DirectionButtons handleNext={handleNext} />
      {errors.rentOrOwn && (
        <Alert severity="error" sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}>
          {t('Your form is missing information.')}
          <ul>{errors.rentOrOwn && <li>{errors.rentOrOwn}</li>}</ul>
        </Alert>
      )}
    </>
  );
};
