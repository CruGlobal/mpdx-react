import { useCallback, useMemo } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import {
  useAdditionalSalaryRequestQuery,
  useSubmitAdditionalSalaryRequestMutation,
  useUpdateAdditionalSalaryRequestMutation,
} from '../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getTotal } from './Helper/getTotal';

// Field configuration: combines keys, labels, and max values
export const fieldConfig: Array<{
  key: string;
  label: string;
  max?: number;
}> = [
  { key: 'currentYearSalaryNotReceived', label: "Current Year's Salary" },
  { key: 'previousYearSalaryNotReceived', label: "Previous Year's Salary" },
  { key: 'additionalSalaryWithinMax', label: 'Additional Salary' },
  { key: 'adoption', label: 'Adoption', max: 15000 },
  { key: 'traditional403bContribution', label: '403(b) Contribution' },
  { key: 'counselingNonMedical', label: 'Counseling' },
  { key: 'healthcareExpensesExceedingLimit', label: 'Healthcare Expenses' },
  { key: 'babysittingMinistryEvents', label: 'Babysitting' },
  { key: 'childrenMinistryTripExpenses', label: "Children's Ministry Trip" },
  { key: 'childrenCollegeEducation', label: "Children's College" },
  { key: 'movingExpense', label: 'Moving Expense' },
  { key: 'seminary', label: 'Seminary' },
  { key: 'housingDownPayment', label: 'Housing Down Payment', max: 50000 },
  { key: 'autoPurchase', label: 'Auto Purchase' },
  {
    key: 'expensesNotApprovedWithin90Days',
    label: 'Reimbursable Expenses',
  },
];

interface UseAdditionalSalaryRequestFormProps {
  requestId: string;
  initialValues?: CompleteFormValues;
}

export const useAdditionalSalaryRequestForm = ({
  requestId,
  initialValues: providedInitialValues,
}: UseAdditionalSalaryRequestFormProps) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { handleNextStep } = useAdditionalSalaryRequest();

  const { data: requestData } = useAdditionalSalaryRequestQuery({
    variables: { requestId: requestId || '' },
    skip: !requestId,
  });

  const [updateAdditionalSalaryRequest] =
    useUpdateAdditionalSalaryRequestMutation();

  const [submitAdditionalSalaryRequest] =
    useSubmitAdditionalSalaryRequestMutation();

  const createCurrencyValidation = useCallback(
    (fieldName: string, max?: number) => {
      let schema = amount(fieldName, t);
      if (max) {
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
    phoneNumber: '',
  } as CompleteFormValues;

  const initialValues: CompleteFormValues = useMemo(() => {
    if (providedInitialValues) {
      return providedInitialValues;
    }

    const request = requestData?.additionalSalaryRequest;
    if (!request) {
      return defaultInitialValues;
    }

    return {
      ...Object.fromEntries(
        fieldConfig.map(({ key }) => [
          key,
          String((request[key as keyof typeof request] as number) || 0),
        ]),
      ),
      deductTwelvePercent: request.deductTwelvePercent || false,
      phoneNumber: request.phoneNumber || '',
    } as CompleteFormValues;
  }, [providedInitialValues, requestData?.additionalSalaryRequest]);

  const validationSchema = useMemo(
    () =>
      yup.object({
        ...Object.fromEntries(
          fieldConfig.map(({ key, label, max }) => [
            key,
            createCurrencyValidation(t(label), max),
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
      }),
    [createCurrencyValidation, t],
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
                typeof value === 'string' && key !== 'phoneNumber'
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

  return formik;
};
