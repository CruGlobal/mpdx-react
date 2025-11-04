import { useEffect, useState } from 'react';
import { OpenInNew } from '@mui/icons-material';
import {
  Alert,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Link,
  Typography,
} from '@mui/material';
import { Formik, useFormikContext } from 'formik';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import i18n from 'src/lib/i18n';
import { dateFormatShort } from 'src/lib/intlFormat';
import { mocks } from '../../../Shared/mockData';
import { RentOwnEnum } from '../../../Shared/sharedTypes';
import { FormValues } from '../../NewRequestPage';
import { DirectionButtons } from '../../Shared/DirectionButtons';
import { CostOfHome } from './CalcComponents/CostOfHome';
import { EndingSection } from './CalcComponents/EndingSection';
import { FairRentalValue } from './CalcComponents/FairRentalValue';
import { RequestSummaryCard } from './CalcComponents/RequestSummaryCard';

//TODO: Get correct links
interface CalculationProps {
  boardApprovalDate: string;
  availableDate: string;
  handleBack: () => void;
  handleNext: () => void;
}
export interface CalculationFormValues {
  rentalValue?: number | null | undefined;
  furnitureCostsOne?: number | null | undefined;
  avgUtilityOne?: number | null | undefined;
  mortgagePayment?: number | null | undefined;
  furnitureCostsTwo?: number | null | undefined;
  repairCosts?: number | null | undefined;
  avgUtilityTwo?: number | null | undefined;
  unexpectedExpenses?: number | null | undefined;
  phone?: string;
  email?: string;
  isChecked?: boolean;
}

const getValidationSchema = (rentOrOwn?: RentOwnEnum) => {
  const baseSchema = {
    mortgagePayment: yup.number().required(i18n.t('Required field.')),
    furnitureCostsTwo: yup.number().required(i18n.t('Required field.')),
    repairCosts: yup.number().required(i18n.t('Required field.')),
    avgUtilityTwo: yup.number().required(i18n.t('Required field.')),
    unexpectedExpenses: yup.number().required(i18n.t('Required field.')),
    phone: yup
      .string()
      .test(
        'is-phone-number',
        i18n.t('Invalid phone number.'),
        (val) => typeof val === 'string' && /\d/.test(val),
      )
      .required(i18n.t('Phone Number is required.')),
    email: yup
      .string()
      .email(i18n.t('Invalid email address.'))
      .required(i18n.t('Email is required.')),
    isChecked: yup
      .boolean()
      .oneOf([true], i18n.t('This box must be checked to continue.')),
  };

  // extra fields for OWN
  if (rentOrOwn === RentOwnEnum.Own) {
    return yup.object({
      ...baseSchema,
      rentalValue: yup.number().required(i18n.t('Required field.')),
      furnitureCostsOne: yup.number().required(i18n.t('Required field.')),
      avgUtilityOne: yup.number().required(i18n.t('Required field.')),
    });
  }

  return yup.object(baseSchema);
};

export const Calculation: React.FC<CalculationProps> = ({
  boardApprovalDate,
  availableDate,
  handleBack,
  handleNext,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { values } = useFormikContext<FormValues>();
  const { rentOrOwn } = values;

  const initialValues: CalculationFormValues = {
    rentalValue: undefined,
    furnitureCostsOne: undefined,
    avgUtilityOne: undefined,
    mortgagePayment: undefined,
    furnitureCostsTwo: undefined,
    repairCosts: undefined,
    avgUtilityTwo: undefined,
    unexpectedExpenses: undefined,
    phone: mocks[0].staffInfo.phone,
    email: mocks[0].staffInfo.email,
    isChecked: false,
  };

  const boardDateFormatted = dateFormatShort(
    DateTime.fromISO(boardApprovalDate ?? DateTime.now().toISO()),
    locale,
  );

  const availableDateFormatted = dateFormatShort(
    DateTime.fromISO(availableDate ?? DateTime.now().toISO()),
    locale,
  );

  return (
    <Formik<CalculationFormValues>
      initialValues={initialValues}
      validationSchema={getValidationSchema(rentOrOwn)}
      validateOnChange
      validateOnBlur
      onSubmit={() => {
        handleNext();
      }}
    >
      {({
        isValid,
        submitCount,
        values,
        errors,
        setFieldValue,
        handleBlur,
        touched,
      }) => {
        const showAlert = submitCount > 0 && (!isValid || !values.isChecked);

        const [closedAt, setClosedAt] = useState<number | null>(null);

        const open = showAlert && closedAt !== submitCount;

        useEffect(() => {
          if (!showAlert) {
            setClosedAt(null);
          }
        }, [showAlert]);

        return (
          <form noValidate>
            <Box mb={2}>
              <Typography variant="h5">
                {t('Calculate Your MHA Request')}
              </Typography>
            </Box>
            <Trans i18nKey="newRequestCalculation">
              <p style={{ lineHeight: 1.5 }}>
                Please enter dollar amounts for each category below to calculate
                your Annual MHA. The board will review this number after{' '}
                {boardDateFormatted} and you will receive notice of your
                approval effective {availableDateFormatted}.
              </p>
            </Trans>
            <Box sx={{ mt: 2, mb: 3 }}>
              <OpenInNew
                fontSize="medium"
                sx={{ verticalAlign: 'middle', opacity: 0.56 }}
              />{' '}
              <Link href="">What expenses can I claim on my MHA?</Link>
            </Box>
            {rentOrOwn === RentOwnEnum.Own && (
              <Box mb={3}>
                <FairRentalValue />
              </Box>
            )}
            <CostOfHome rentOrOwn={rentOrOwn} />
            <Box mt={3} mb={3}>
              <RequestSummaryCard rentOrOwn={rentOrOwn} />
            </Box>
            <FormControl error={Boolean(touched.isChecked && errors.isChecked)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(values.isChecked)}
                    onChange={(e) =>
                      setFieldValue('isChecked', e.target.checked)
                    }
                    onBlur={handleBlur}
                    name="isChecked"
                  />
                }
                label={t(
                  'I understand that my approved Annual MHA will be based on the lower of the Annual Fair Rental Value or the Annual Cost of Providing a Home.',
                )}
              />
              <FormHelperText sx={{ ml: 4 }}>
                {touched.isChecked && errors.isChecked ? (
                  <i>{errors.isChecked}</i>
                ) : (
                  <i>{t('This box must be checked to continue.')}</i>
                )}
              </FormHelperText>
            </FormControl>
            <EndingSection />
            {open && (
              <Alert
                severity="error"
                onClose={() => setClosedAt(submitCount)}
                sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}
              >
                {t('Your form is missing information.')}
                <ul>
                  {submitCount > 0 &&
                    Object.keys(errors).some((k) => k !== 'isChecked') && (
                      <li>
                        {t('Please enter a value for all required fields.')}
                      </li>
                    )}
                  {!values.isChecked && (
                    <li>
                      {t(
                        'Please check the box above if you understand how this was calculated.',
                      )}
                    </li>
                  )}
                </ul>
              </Alert>
            )}
            <DirectionButtons handleBack={handleBack} isCalculate />
          </form>
        );
      }}
    </Formik>
  );
};
