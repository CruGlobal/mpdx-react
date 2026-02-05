import { useCallback, useMemo } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import {
  useAdditionalSalaryRequestQuery,
  useSubmitAdditionalSalaryRequestMutation,
  useUpdateAdditionalSalaryRequestMutation,
} from '../AdditionalSalaryRequest.generated';
import { CompleteFormValues } from '../MainPages/OverviewPage';
import { SalaryInfoQuery } from '../SalaryInfo.generated';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getTotal } from './Helper/getTotal';

type SalaryInfo = NonNullable<SalaryInfoQuery['salaryInfo']>;

// Field configuration: combines keys, labels, and optional salaryInfo key pairs for dynamic max values
export const fieldConfig: Array<{
  key: string;
  label: string;
  salaryInfoIntKey?: keyof SalaryInfo;
  salaryInfoUssKey?: keyof SalaryInfo;
}> = [
  { key: 'currentYearSalaryNotReceived', label: "Current Year's Salary" },
  { key: 'previousYearSalaryNotReceived', label: "Previous Year's Salary" },
  { key: 'additionalSalaryWithinMax', label: 'Additional Salary' },
  {
    key: 'adoption',
    label: 'Adoption',
    salaryInfoIntKey: 'maxAdoptionInt',
    salaryInfoUssKey: 'maxAdoptionUss',
  },
  { key: 'traditional403bContribution', label: '403(b) Contribution' },
  { key: 'counselingNonMedical', label: 'Counseling' },
  { key: 'healthcareExpensesExceedingLimit', label: 'Healthcare Expenses' },
  { key: 'babysittingMinistryEvents', label: 'Babysitting' },
  { key: 'childrenMinistryTripExpenses', label: "Children's Ministry Trip" },
  {
    key: 'childrenCollegeEducation',
    label: "Children's College",
    salaryInfoIntKey: 'maxCollegeInt',
    salaryInfoUssKey: 'maxCollegeUss',
  },
  { key: 'movingExpense', label: 'Moving Expense' },
  { key: 'seminary', label: 'Seminary' },
  {
    key: 'housingDownPayment',
    label: 'Housing Down Payment',
    salaryInfoIntKey: 'maxHousingDownPaymentInt',
    salaryInfoUssKey: 'maxHousingDownPaymentUss',
  },
  {
    key: 'autoPurchase',
    label: 'Auto Purchase',
    salaryInfoIntKey: 'maxAutoPurchaseInt',
    salaryInfoUssKey: 'maxAutoPurchaseUss',
  },
  {
    key: 'expensesNotApprovedWithin90Days',
    label: 'Reimbursable Expenses',
  },
];

export const useAdditionalSalaryRequestForm = (
  providedInitialValues?: CompleteFormValues,
) => {
  const { requestId } = useAdditionalSalaryRequest();
  const { t } = useTranslation();
  const locale = useLocale();
  const { handleNextStep, user, salaryInfo, isInternational } =
    useAdditionalSalaryRequest();

  const { data: requestData } = useAdditionalSalaryRequestQuery();

  const [updateAdditionalSalaryRequest] =
    useUpdateAdditionalSalaryRequestMutation();

  const [submitAdditionalSalaryRequest] =
    useSubmitAdditionalSalaryRequestMutation();

  const createCurrencyValidation = useCallback(
    (fieldName: string, max?: number) => {
      let schema = amount(fieldName, t);
      if (max !== null && max !== undefined) {
        schema = schema.max(
          max,
          t('Exceeds {{amount}} limit', {
            amount: currencyFormat(max, 'USD', locale, {
              showTrailingZeros: true,
            }),
          }),
        );
      }
      return schema;
    },
    [t, locale],
  );

  const defaultInitialValues: CompleteFormValues = {
    ...Object.fromEntries(fieldConfig.map(({ key }) => [key, '0'])),
    deductTwelvePercent: false,
    phoneNumber: user?.staffInfo?.primaryPhoneNumber || '',
    emailAddress: user?.staffInfo?.emailAddress || '',
  } as CompleteFormValues;

  const initialValues: CompleteFormValues = useMemo(() => {
    if (providedInitialValues) {
      return providedInitialValues;
    }

    const request = requestData?.latestAdditionalSalaryRequest;
    if (!request) {
      return defaultInitialValues;
    }

    return {
      ...Object.fromEntries(
        fieldConfig.map(({ key }) => [
          key,
          String((request[key as keyof typeof request] as number) || ''),
        ]),
      ),
      deductTwelvePercent: request.deductTwelvePercent || false,
      phoneNumber:
        request.phoneNumber || user?.staffInfo?.primaryPhoneNumber || '',
      emailAddress: request.emailAddress || user?.staffInfo?.emailAddress || '',
    } as CompleteFormValues;
  }, [providedInitialValues, requestData?.latestAdditionalSalaryRequest, user]);

  const getMaxForField = useCallback(
    (field: (typeof fieldConfig)[number]): number | undefined => {
      if (!field.salaryInfoIntKey || !field.salaryInfoUssKey || !salaryInfo) {
        return undefined;
      }
      const key = isInternational
        ? field.salaryInfoIntKey
        : field.salaryInfoUssKey;
      return salaryInfo[key] as number | undefined;
    },
    [salaryInfo, isInternational],
  );

  const validationSchema = useMemo(
    () =>
      yup.object({
        ...Object.fromEntries(
          fieldConfig.map((field) => [
            field.key,
            createCurrencyValidation(t(field.label), getMaxForField(field)),
          ]),
        ),
        deductTwelvePercent: yup.boolean(),
        phoneNumber: yup
          .string()
          .required(t('Telephone number is required'))
          .matches(
            /^[\d\s\-\(\)\+]+$/,
            t('Please enter a valid telephone number'),
          ),
        emailAddress: yup
          .string()
          .required(t('Email address is required'))
          .email(t('Please enter a valid email address')),
      }),
    [createCurrencyValidation, t, getMaxForField],
  );

  const onSubmit = useCallback(
    (values: CompleteFormValues) => {
      if (!requestId) {
        return;
      }

      updateAdditionalSalaryRequest({
        variables: {
          id: requestId,
          attributes: {
            ...Object.fromEntries(
              Object.entries(values).map(([key, value]) =>
                typeof value === 'string' &&
                key !== 'phoneNumber' &&
                key !== 'emailAddress'
                  ? [key, parseFloat(value) || 0]
                  : [key, value],
              ),
            ),
            totalAdditionalSalaryRequested: getTotal(values),
          },
        },
        onCompleted: () => {
          submitAdditionalSalaryRequest({
            variables: {
              id: requestId,
            },
            onCompleted: () => {
              handleNextStep();
            },
          });
        },
      });
    },
    [
      requestId,
      updateAdditionalSalaryRequest,
      submitAdditionalSalaryRequest,
      handleNextStep,
    ],
  );

  const formik = useFormik<CompleteFormValues>({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  return { ...formik, validationSchema };
};
