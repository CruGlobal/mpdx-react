import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { OpenInNew } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import {
  Alert,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Link,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import {
  SimpleScreenOnly,
  StyledPrintButton,
} from 'src/components/Reports/styledComponents';
import { useLocale } from 'src/hooks/useLocale';
import i18n from 'src/lib/i18n';
import { dateFormatShort } from 'src/lib/intlFormat';
import { DirectionButtons } from '../../../Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { useMinisterHousingAllowance } from '../../Shared/Context/MinisterHousingAllowanceContext';
import { editOwnMock, mocks } from '../../Shared/mockData';
import { RentOwnEnum } from '../../Shared/sharedTypes';
import { CostOfHome } from './CalcComponents/CostOfHome';
import { EndingSection } from './CalcComponents/EndingSection';
import { FairRentalValue } from './CalcComponents/FairRentalValue';
import { PersonInfo } from './CalcComponents/PersonInfo';
import { RequestSummaryCard } from './CalcComponents/RequestSummaryCard';

// TODO: get correct link for "What expenses can I claim on my MHA?"

interface CalculationProps {
  boardApprovalDate: string | null;
  availableDate: string | null;
  rentOrOwn: RentOwnEnum | undefined;
  handlePrint?: () => void;
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
  rentOrOwn,
  handlePrint,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { query } = useRouter();
  const print = query.print === 'true';

  const {
    handleNextStep,
    handlePreviousStep,
    pageType,
    setHasCalcValues,
    setIsPrint,
    isPrint,
  } = useMinisterHousingAllowance();

  const actionRequired =
    pageType === PageEnum.Edit || pageType === PageEnum.View;
  const isViewPage = pageType === PageEnum.View;

  const initialValues: CalculationFormValues = actionRequired
    ? {
        rentalValue: editOwnMock.rentalValue,
        furnitureCostsOne: editOwnMock.furnitureCostsOne,
        avgUtilityOne: editOwnMock.avgUtilityOne,
        mortgagePayment: editOwnMock.mortgagePayment,
        furnitureCostsTwo: editOwnMock.furnitureCostsTwo,
        repairCosts: editOwnMock.repairCosts,
        avgUtilityTwo: editOwnMock.avgUtilityTwo,
        unexpectedExpenses: editOwnMock.unexpectedExpenses,
        phone: mocks[0].staffInfo.phone,
        email: mocks[0].staffInfo.email,
        isChecked: editOwnMock.isChecked,
      }
    : {
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
    : t('approval soon');

  useEffect(() => {
    setIsPrint(print);
  }, [print, setIsPrint]);

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
        submitForm,
        validateForm,
      }) => {
        const showAlert = !!submitCount && (!isValid || !values.isChecked);

        useEffect(() => {
          const hasValues = Object.values(values).some(
            (value) => value !== undefined && value !== null && value !== '',
          );
          setHasCalcValues(hasValues);
        }, [values, setHasCalcValues]);

        return (
          <form noValidate>
            <Box mb={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5">
                  {isViewPage
                    ? t('Your MHA Request')
                    : t('Calculate Your MHA Request')}
                </Typography>
                {isPrint && (
                  <SimpleScreenOnly>
                    <StyledPrintButton
                      startIcon={
                        <SvgIcon fontSize="small">
                          <PrintIcon titleAccess={t('Print')} />
                        </SvgIcon>
                      }
                      onClick={handlePrint}
                    >
                      {t('Print')}
                    </StyledPrintButton>
                  </SimpleScreenOnly>
                )}
              </Box>
            </Box>
            {isViewPage ? (
              <PersonInfo />
            ) : (
              <Trans
                i18nKey="newRequestCalculation"
                values={{ after, approval }}
              >
                {actionRequired ? (
                  <p style={{ lineHeight: 1.5 }}>
                    Please review the Annual MHA Request that you have submitted
                    for Board approval and make any changes necessary here. The
                    board will review this {after} and you will receive notice
                    of your {approval}.
                  </p>
                ) : (
                  <p style={{ lineHeight: 1.5 }}>
                    Please enter dollar amounts for each category below to
                    calculate your Annual MHA. The board will review this{' '}
                    {after} and you will receive notice of your {approval}.
                  </p>
                )}
              </Trans>
            )}
            {!isPrint && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <OpenInNew
                  fontSize="medium"
                  sx={{ verticalAlign: 'middle', opacity: 0.56 }}
                />{' '}
                <Link component="button" type="button">
                  What expenses can I claim on my MHA?
                </Link>
              </Box>
            )}
            {isViewPage && (
              <Box mb={3}>
                <RequestSummaryCard rentOrOwn={rentOrOwn} />
              </Box>
            )}
            {rentOrOwn === RentOwnEnum.Own && (
              <Box mb={3}>
                <FairRentalValue />
              </Box>
            )}
            <CostOfHome rentOrOwn={rentOrOwn} />
            {!isViewPage && (
              <>
                <Box mt={3} mb={3}>
                  <RequestSummaryCard rentOrOwn={rentOrOwn} />
                </Box>
                <FormControl
                  error={Boolean(touched.isChecked && errors.isChecked)}
                >
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
              </>
            )}
            {!isViewPage && <EndingSection />}
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
            {!isViewPage && (
              <DirectionButtons
                isSubmission
                showBackButton
                handleNextStep={handleNextStep}
                handlePreviousStep={handlePreviousStep}
                submitForm={submitForm}
                validateForm={validateForm}
                submitCount={submitCount}
                isValid={isValid}
              />
            )}
          </form>
        );
      }}
    </Formik>
  );
};
