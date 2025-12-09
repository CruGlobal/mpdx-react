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
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import {
  SimpleScreenOnly,
  StyledPrintButton,
} from 'src/components/Reports/styledComponents';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import i18n from 'src/lib/i18n';
import { dateFormatShort } from 'src/lib/intlFormat';
import { phoneNumber } from 'src/lib/yupHelpers';
import { DirectionButtons } from '../../../Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { useSubmitMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import { hasPopulatedValues } from '../../Shared/Context/Helper/hasPopulatedValues';
import { useMinisterHousingAllowance } from '../../Shared/Context/MinisterHousingAllowanceContext';
import { CostOfHome } from './CalcComponents/CostOfHome';
import { EndingSection } from './CalcComponents/EndingSection';
import { FairRentalValue } from './CalcComponents/FairRentalValue';
import { PersonInfo } from './CalcComponents/PersonInfo';
import { RequestSummaryCard } from './CalcComponents/RequestSummaryCard';

// TODO: get correct link for "What expenses can I claim on my MHA?"

interface CalculationProps {
  boardApprovedAt: string | null;
  availableDate: string | null;
  deadlineDate?: string | null;
  rentOrOwn?: MhaRentOrOwnEnum;
  handlePrint?: () => void;
}
export interface CalculationFormValues {
  rentalValue?: number | null;
  furnitureCostsOne?: number | null;
  avgUtilityOne?: number | null;
  mortgageOrRentPayment?: number | null;
  furnitureCostsTwo?: number | null;
  repairCosts?: number | null;
  avgUtilityTwo?: number | null;
  unexpectedExpenses?: number | null;
  phoneNumber?: string | null;
  emailAddress?: string | null;
  iUnderstandMhaPolicy?: boolean;
}

const getValidationSchema = (rentOrOwn?: MhaRentOrOwnEnum) => {
  const baseSchema = {
    mortgageOrRentPayment: yup
      .number()
      .moreThan(0, i18n.t('Must be greater than $0.'))
      .required(i18n.t('Required field.')),
    furnitureCostsTwo: yup
      .number()
      .moreThan(0, i18n.t('Must be greater than $0.'))
      .required(i18n.t('Required field.')),
    repairCosts: yup
      .number()
      .moreThan(0, i18n.t('Must be greater than $0.'))
      .required(i18n.t('Required field.')),
    avgUtilityTwo: yup
      .number()
      .moreThan(0, i18n.t('Must be greater than $0.'))
      .required(i18n.t('Required field.')),
    unexpectedExpenses: yup
      .number()
      .moreThan(0, i18n.t('Must be greater than $0.'))
      .required(i18n.t('Required field.')),
    phoneNumber: phoneNumber(i18n.t).required(
      i18n.t('Phone Number is required.'),
    ),
    emailAddress: yup
      .string()
      .email(i18n.t('Invalid email address.'))
      .required(i18n.t('Email is required.')),
    iUnderstandMhaPolicy: yup
      .boolean()
      .oneOf([true], i18n.t('This box must be checked to continue.')),
  };

  // extra fields for OWN
  if (rentOrOwn === MhaRentOrOwnEnum.Own) {
    return yup.object({
      ...baseSchema,
      rentalValue: yup
        .number()
        .moreThan(0, i18n.t('Must be greater than $0.'))
        .required(i18n.t('Required field.')),
      furnitureCostsOne: yup
        .number()
        .moreThan(0, i18n.t('Must be greater than $0.'))
        .required(i18n.t('Required field.')),
      avgUtilityOne: yup
        .number()
        .moreThan(0, i18n.t('Must be greater than $0.'))
        .required(i18n.t('Required field.')),
    });
  }

  return yup.object(baseSchema);
};

export const Calculation: React.FC<CalculationProps> = ({
  boardApprovedAt,
  availableDate,
  deadlineDate,
  rentOrOwn,
  handlePrint,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { query } = router;
  const print = query.print === 'true';

  const [submitMutation] = useSubmitMinistryHousingAllowanceRequestMutation();

  const {
    handleNextStep,
    handlePreviousStep,
    pageType,
    setHasCalcValues,
    setIsPrint,
    isPrint,
    requestData,
    updateMutation,
    userHcmData,
  } = useMinisterHousingAllowance();

  const updateCheckbox = (value: boolean) =>
    updateMutation({
      variables: {
        input: {
          requestId: requestData?.id ?? '',
          requestAttributes: {
            iUnderstandMhaPolicy: value,
          },
        },
      },
    });

  const request = requestData ? requestData.requestAttributes : null;

  const actionRequired =
    pageType === PageEnum.Edit || pageType === PageEnum.View;
  const isViewPage = pageType === PageEnum.View;

  const initialValues: CalculationFormValues = actionRequired
    ? {
        rentalValue: request?.rentalValue,
        furnitureCostsOne: request?.furnitureCostsOne,
        avgUtilityOne: request?.avgUtilityOne,
        mortgageOrRentPayment: request?.mortgageOrRentPayment,
        furnitureCostsTwo: request?.furnitureCostsTwo,
        repairCosts: request?.repairCosts,
        avgUtilityTwo: request?.avgUtilityTwo,
        unexpectedExpenses: request?.unexpectedExpenses,
        phoneNumber:
          request?.phoneNumber ??
          userHcmData?.staffInfo.primaryPhoneNumber ??
          null,
        emailAddress:
          request?.emailAddress ?? userHcmData?.staffInfo.emailAddress ?? null,
        iUnderstandMhaPolicy: request?.iUnderstandMhaPolicy ?? false,
      }
    : {
        rentalValue: null,
        furnitureCostsOne: null,
        avgUtilityOne: null,
        mortgageOrRentPayment: null,
        furnitureCostsTwo: null,
        repairCosts: null,
        avgUtilityTwo: null,
        unexpectedExpenses: null,
        phoneNumber:
          request?.phoneNumber ??
          userHcmData?.staffInfo.primaryPhoneNumber ??
          null,
        emailAddress:
          request?.emailAddress ?? userHcmData?.staffInfo.emailAddress ?? null,
        iUnderstandMhaPolicy: false,
      };

  const boardDateFormatted = boardApprovedAt
    ? dateFormatShort(DateTime.fromISO(boardApprovedAt), locale)
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

  const schema = getValidationSchema(rentOrOwn);

  return (
    <Formik<CalculationFormValues>
      initialValues={initialValues}
      validationSchema={schema}
      validateOnChange
      validateOnBlur
      onSubmit={() => {
        try {
          submitMutation({
            variables: { input: { requestId: requestData?.id ?? '' } },
          });
          enqueueSnackbar(t('MHA request submitted successfully.'), {
            variant: 'success',
          });
          handleNextStep();
        } catch (error) {}
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
        const showAlert =
          !!submitCount && (!isValid || !values.iUnderstandMhaPolicy);

        useEffect(() => {
          const hasValues = hasPopulatedValues(values);
          setHasCalcValues(hasValues);
        }, [values, setHasCalcValues]);

        const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const checked = e.target.checked;

          setFieldValue('iUnderstandMhaPolicy', checked);
          updateCheckbox(checked);
        };

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
            {rentOrOwn === MhaRentOrOwnEnum.Own && (
              <Box mb={3}>
                <FairRentalValue schema={schema} />
              </Box>
            )}
            <CostOfHome schema={schema} rentOrOwn={rentOrOwn} />
            {!isViewPage && (
              <>
                <Box mt={3} mb={3}>
                  <RequestSummaryCard rentOrOwn={rentOrOwn} />
                </Box>
                <FormControl
                  error={Boolean(
                    touched.iUnderstandMhaPolicy && errors.iUnderstandMhaPolicy,
                  )}
                >
                  <FormControlLabel
                    sx={{
                      alignItems: 'flex-start',
                      '& .MuiFormControlLabel-label': { mt: 1 },
                    }}
                    control={
                      <Checkbox
                        checked={Boolean(values.iUnderstandMhaPolicy)}
                        onChange={handleOnChange}
                        onBlur={handleBlur}
                        name="iUnderstandMhaPolicy"
                      />
                    }
                    label={t(
                      'I understand that my approved Annual MHA will be based on the lower of the Annual Fair Rental Value or the Annual Cost of Providing a Home.',
                    )}
                  />
                  <FormHelperText sx={{ ml: 4 }}>
                    {touched.iUnderstandMhaPolicy &&
                    errors.iUnderstandMhaPolicy ? (
                      <i>{errors.iUnderstandMhaPolicy}</i>
                    ) : (
                      <i>{t('This box must be checked to continue.')}</i>
                    )}
                  </FormHelperText>
                </FormControl>
              </>
            )}
            {!isViewPage && <EndingSection schema={schema} />}
            {showAlert && (
              <Alert severity="error" sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}>
                {t('Your form is missing information.')}
                <ul>
                  {!!submitCount &&
                    Object.keys(errors).some(
                      (k) => k !== 'iUnderstandMhaPolicy',
                    ) && (
                      <li>
                        {t('Please enter a value for all required fields.')}
                      </li>
                    )}
                  {!values.iUnderstandMhaPolicy && (
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
                deadlineDate={deadlineDate ?? ''}
                actionRequired={actionRequired}
              />
            )}
          </form>
        );
      }}
    </Formik>
  );
};
