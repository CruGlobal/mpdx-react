import React, { createContext, useCallback, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { FormikProvider, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { useStepList } from 'src/hooks/useStepList';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import {
  FormEnum,
  PageEnum,
} from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import { useHcmDataQuery } from '../../Shared/HcmData/HCMData.generated';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import {
  AdditionalSalaryRequestsQuery,
  useAdditionalSalaryRequestQuery,
  useAdditionalSalaryRequestsQuery,
  useSubmitAdditionalSalaryRequestMutation,
  useUpdateAdditionalSalaryRequestMutation,
} from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { getTotal } from './Helper/getTotal';

export type AdditionalSalaryRequestType = {
  steps: Steps[];
  currentIndex: number;
  currentStep: AdditionalSalaryRequestSectionEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  preferredName: string;
  requestsData?:
    | AdditionalSalaryRequestsQuery['additionalSalaryRequests']['nodes']
    | null;
  requestsError?: ApolloError;
};

const AdditionalSalaryRequestContext =
  createContext<AdditionalSalaryRequestType | null>(null);

export const useAdditionalSalaryRequest = (): AdditionalSalaryRequestType => {
  const context = React.useContext(AdditionalSalaryRequestContext);
  if (context === null) {
    throw new Error(
      'Could not find AdditionalSalaryRequestContext. Make sure that your component is inside <AdditionalSalaryRequestProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
  initialValues?: CompleteFormValues;
  requestId?: string;
  type?: PageEnum;
}

const objects = Object.values(AdditionalSalaryRequestSectionEnum);

export const AdditionalSalaryRequestProvider: React.FC<Props> = ({
  children,
  initialValues: providedInitialValues,
  requestId: providedRequestId,
}) => {
  const { t } = useTranslation();
  const { steps, nextStep, previousStep, currentIndex } = useStepList(
    FormEnum.AdditionalSalary,
  );
  const locale = useLocale();

  const { data: hcmData } = useHcmDataQuery();

  const { data: requestsData, error: requestsError } =
    useAdditionalSalaryRequestsQuery();

  const requestId = providedRequestId;

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
    [t],
  );

  // Currency field keys for form
  const currencyFields = [
    'currentYearSalaryNotReceived',
    'previousYearSalaryNotReceived',
    'additionalSalaryWithinMax',
    'adoption',
    'traditional403bContribution',
    'counselingNonMedical',
    'healthcareExpensesExceedingLimit',
    'babysittingMinistryEvents',
    'childrenMinistryTripExpenses',
    'childrenCollegeEducation',
    'movingExpense',
    'seminary',
    'housingDownPayment',
    'autoPurchase',
    'expensesNotApprovedWithin90Days',
  ] as const;

  const defaultInitialValues: CompleteFormValues = {
    ...Object.fromEntries(currencyFields.map((key) => [key, '0'])),
    deductTwelvePercent: false,
    phoneNumber: '',
  } as CompleteFormValues;

  // Populate initialValues from requestData if available
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
        currencyFields.map((key) => [
          key,
          String((request[key as keyof typeof request] as number) || 0),
        ]),
      ),
      deductTwelvePercent: request.deductTwelvePercent || false,
      phoneNumber: request.phoneNumber || '',
    } as CompleteFormValues;
  }, [providedInitialValues, requestData]);

  // Field validation configuration: [fieldKey, label, maxValue?]
  const fieldValidations: Array<[string, string, number?]> = [
    ['currentYearSalaryNotReceived', t("Current Year's Salary")],
    ['previousYearSalaryNotReceived', t("Previous Year's Salary")],
    ['additionalSalaryWithinMax', t('Additional Salary')],
    ['adoption', t('Adoption'), 15000],
    ['traditional403bContribution', t('403(b) Contribution')],
    ['counselingNonMedical', t('Counseling')],
    ['healthcareExpensesExceedingLimit', t('Healthcare Expenses')],
    ['babysittingMinistryEvents', t('Babysitting')],
    ['childrenMinistryTripExpenses', t("Children's Ministry Trip")],
    ['childrenCollegeEducation', t("Children's College")],
    ['movingExpense', t('Moving Expense')],
    ['seminary', t('Seminary')],
    ['housingDownPayment', t('Housing Down Payment'), 50000],
    ['autoPurchase', t('Auto Purchase')],
    ['expensesNotApprovedWithin90Days', t('Reimbursable Expenses')],
  ];

  const validationSchema = useMemo(
    () =>
      yup.object({
        ...Object.fromEntries(
          fieldValidations.map(([key, label, max]) => [
            key,
            createCurrencyValidation(label, max),
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

  // Step Handlers
  const [currentStep, setCurrentStep] = useState(
    AdditionalSalaryRequestSectionEnum.AboutForm,
  );

  const handleNextStep = useCallback(() => {
    const next = objects[currentIndex + 1];
    nextStep();

    setCurrentStep(next);
  }, [currentIndex, objects, nextStep]);

  const handlePreviousStep = useCallback(() => {
    const next = objects[currentIndex - 1];
    previousStep();

    setCurrentStep(next);
  }, [currentIndex, objects, previousStep]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);


  const handleSubmit = useCallback(
    (values: CompleteFormValues) => {
      if (!requestId) {
        return;
      }

      // First update the request with the form values
      updateAdditionalSalaryRequest({
        variables: {
          id: requestId,
          attributes: {
            ...Object.fromEntries(
              Object.entries(values).map(([key, value]) =>
                // Convert string numbers to floats, but keep phoneNumber as string
                typeof value === 'string' && key !== 'phoneNumber'
                  ? [key, parseFloat(value) || 0]
                  : [key, value],
              ),
            ),
            totalAdditionalSalaryRequested: getTotal(values),
          },
        },
        onCompleted: () => {
          // Then submit the request
          submitAdditionalSalaryRequest({
            variables: {
              id: requestId,
            },
            onCompleted: () => {
              handleNextStep();
            },
            onError: (_error) => {
              // Error handling can be implemented here
            },
          });
        },
        onError: (_error) => {
          // Error handling can be implemented here
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
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  const preferredName = useMemo(
    () => hcmData?.hcm?.[0]?.staffInfo?.preferredName || '',
    [hcmData],
  );

  const contextValue = useMemo<AdditionalSalaryRequestType>(
    () => ({
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      preferredName,
      requestsData: requestsData?.additionalSalaryRequests?.nodes,
      requestsError,
    }),
    [
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      preferredName,
      requestsData,
      requestsError,
    ],
  );

  return (
    <FormikProvider value={formik}>
      <AdditionalSalaryRequestContext.Provider value={contextValue}>
        {children}
      </AdditionalSalaryRequestContext.Provider>
    </FormikProvider>
  );
};
