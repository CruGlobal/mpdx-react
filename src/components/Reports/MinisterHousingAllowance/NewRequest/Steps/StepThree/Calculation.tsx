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
import { useMinisterHousingAllowance } from '../../../Shared/MinisterHousingAllowanceContext';
import { mocks } from '../../../Shared/mockData';
import { RentOwnEnum } from '../../../Shared/sharedTypes';
import { FormValues } from '../../NewRequestPage';
import { DirectionButtons } from '../../Shared/DirectionButtons';
import { CostOfHome } from './CalcComponents/CostOfHome';
import { EndingSection } from './CalcComponents/EndingSection';
import { FairRentalValue } from './CalcComponents/FairRentalValue';
import { RequestSummaryCard } from './CalcComponents/RequestSummaryCard';

// TODO: add warning message if user clicks back after entering data in this form
// TODO: get correct link for "What expenses can I claim on my MHA?"

interface CalculationProps {
  boardApprovalDate: string | null;
  availableDate: string | null;
}
export interface CalculationFormValues {
  rentalValue?: number | null;
  furnitureCostsOne?: number | null;
  avgUtilityOne?: number | null;
  mortgagePayment?: number | null;
  furnitureCostsTwo?: number | null;
  repairCosts?: number | null;
  avgUtilityTwo?: number | null;
  unexpectedExpenses?: number | null;
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
      .test('is-phone-number', i18n.t('Invalid phone number.'), (val) => {
        if (!val) {
          return false;
        }
        const cleaned = val.replace(/\D/g, '');
        return /^1?\d{10}$/.test(cleaned);
      })
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
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { handleNextStep } = useMinisterHousingAllowance();

  const {
    values: { rentOrOwn },
  } = useFormikContext<FormValues>();

  const initialValues: CalculationFormValues = {
    rentalValue: null,
    furnitureCostsOne: null,
    avgUtilityOne: null,
    mortgagePayment: null,
    furnitureCostsTwo: null,
    repairCosts: null,
    avgUtilityTwo: null,
    unexpectedExpenses: null,
    phone: mocks[0].staffInfo.phone,
    email: mocks[0].staffInfo.email,
    isChecked: false,
  };

  const boardDateFormatted = boardApprovalDate
    ? dateFormatShort(DateTime.fromISO(boardApprovalDate), locale)
    : null;

  const availableDateFormatted = availableDate
    ? dateFormatShort(DateTime.fromISO(availableDate), locale)
    : null;

  const after = boardDateFormatted
    ? t(`number after ${boardDateFormatted}`)
    : t('number');

  const approval = availableDateFormatted
    ? t(`approval effective ${availableDateFormatted}`)
    : t('approval');

  return (
    <Formik<CalculationFormValues>
      initialValues={initialValues}
      validationSchema={getValidationSchema(rentOrOwn)}
      validateOnChange
      validateOnBlur
      onSubmit={() => {
        handleNextStep();
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
        const showAlert = !!submitCount && (!isValid || !values.isChecked);

        return (
          <form noValidate>
            <Box mb={2}>
              <Typography variant="h5">
                {t('Calculate Your MHA Request')}
              </Typography>
            </Box>
            <Trans i18nKey="newRequestCalculation" values={{ after, approval }}>
              <p style={{ lineHeight: 1.5 }}>
                Please enter dollar amounts for each category below to calculate
                your Annual MHA. The board will review this {after} and you will
                receive notice of your {approval}.
              </p>
            </Trans>
            <Box sx={{ mt: 2, mb: 3 }}>
              <OpenInNew
                fontSize="medium"
                sx={{ verticalAlign: 'middle', opacity: 0.56 }}
              />{' '}
              <Link component="button" type="button">
                What expenses can I claim on my MHA?
              </Link>
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
                sx={{
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': { mt: 1 },
                }}
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
            {showAlert && (
              <Alert severity="error" sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}>
                {t('Your form is missing information.')}
                <ul>
                  {!!submitCount &&
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
            <DirectionButtons isCalculate />
          </form>
        );
      }}
    </Formik>
  );
};
