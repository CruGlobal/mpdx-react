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
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';
import { DirectionButtons } from '../../../Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { SubmitModal } from '../../../Shared/CalculationReports/SubmitModal/SubmitModal';
import { FormValues } from '../../NewRequest/NewRequestPage';
import { useMinisterHousingAllowance } from '../../Shared/Context/MinisterHousingAllowanceContext';

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

  const {
    pageType,
    hasCalcValues,
    setHasCalcValues,
    handlePreviousStep,
    requestData,
    updateMutation,
  } = useMinisterHousingAllowance();

  const updateRequest = (id: string, rentOrOwn: MhaRentOrOwnEnum) => {
    updateMutation({
      variables: {
        input: {
          requestId: id,
          requestAttributes: {
            rentOrOwn,
            rentalValue: null,
            furnitureCostsOne: null,
            avgUtilityOne: null,
            mortgageOrRentPayment: null,
            furnitureCostsTwo: null,
            repairCosts: null,
            avgUtilityTwo: null,
            unexpectedExpenses: null,
            overallAmount: null,
            iUnderstandMhaPolicy: null,
          },
        },
      },
    });
    setHasCalcValues(false);
  };

  const [pendingValue, setPendingValue] = useState<MhaRentOrOwnEnum | null>(
    null,
  );
  const [displayValue, setDisplayValue] = useState<MhaRentOrOwnEnum | null>(
    null,
  );
  const [isRequestingChange, setIsRequestingChange] = useState(false);

  useEffect(() => {
    setDisplayValue(values.rentOrOwn ?? null);
  }, [values.rentOrOwn]);

  const handleNext = async () => {
    setTouched({ rentOrOwn: true });
    await submitForm();
  };

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!requestData?.id) {
      return;
    }

    const selectedValue = event.target.value as MhaRentOrOwnEnum;
    const previous = values.rentOrOwn;

    if (hasCalcValues) {
      if (previous && previous !== selectedValue) {
        setPendingValue(selectedValue);
        setIsRequestingChange(true);
      } else {
        setFieldValue('rentOrOwn', selectedValue);
        updateRequest(requestData.id, selectedValue);
        setDisplayValue(selectedValue);
      }
    } else {
      handleChange(event);
      updateRequest(requestData.id, selectedValue);
    }
  };

  const handleClose = () => {
    setIsRequestingChange(false);
    setPendingValue(null);
  };

  const handleConfirm = () => {
    if (pendingValue) {
      setFieldValue('rentOrOwn', pendingValue);
      updateRequest(requestData?.id ?? '', pendingValue);
      setDisplayValue(pendingValue);
    }
    setIsRequestingChange(false);
    setPendingValue(null);
  };

  const title = t('Are you sure you want to change selection?');
  const content = t('You are changing your MHA Request selection.');
  const subContent = t(
    'Clicking "Yes, Continue" will wipe all inputs you\'ve entered previously. Are you sure you want to continue?',
  );

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
              value={MhaRentOrOwnEnum.Rent}
              control={<Radio />}
              label={t('Rent')}
            />
            <FormControlLabel
              value={MhaRentOrOwnEnum.Own}
              control={<Radio />}
              label={t('Own')}
            />
          </RadioGroup>
        </FormControl>
        {isRequestingChange && (
          <SubmitModal
            formTitle={t('MHA Request')}
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            overrideTitle={title}
            overrideContent={content}
            overrideSubContent={subContent}
          />
        )}
      </Box>
      <DirectionButtons
        overrideNext={handleNext}
        handlePreviousStep={handlePreviousStep}
        showBackButton={true}
      />
      {errors.rentOrOwn && (
        <Alert severity="error" sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}>
          {t('Your form is missing information.')}
          <ul>{errors.rentOrOwn && <li>{errors.rentOrOwn}</li>}</ul>
        </Alert>
      )}
    </>
  );
};
