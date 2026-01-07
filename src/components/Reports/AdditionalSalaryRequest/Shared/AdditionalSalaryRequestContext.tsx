import React, { createContext, useCallback, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { FormikProvider, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useStepList } from 'src/hooks/useStepList';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import {
  FormEnum,
  PageEnum,
} from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import {
  HcmDataQuery,
  useHcmDataQuery,
} from '../../Shared/HcmData/HCMData.generated';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import {
  AdditionalSalaryRequestQuery,
  AdditionalSalaryRequestsQuery,
  useAdditionalSalaryRequestQuery,
  useAdditionalSalaryRequestsQuery,
  useCreateAdditionalSalaryRequestMutation,
  useSubmitAdditionalSalaryRequestMutation,
  useUpdateAdditionalSalaryRequestMutation,
} from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { getTotal } from './Helper/getTotal';
import { calculateCompletionPercentage } from './calculateCompletionPercentage';

export type AdditionalSalaryRequestType = {
  steps: Steps[];
  currentIndex: number;
  percentComplete: number;
  currentStep: AdditionalSalaryRequestSectionEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  handleCancel: () => void;
  hcmUser: HcmDataQuery['hcm'][0] | null;
  hcmSpouse: HcmDataQuery['hcm'][1] | null;
  isMarried: boolean;
  preferredName: string;
  spousePreferredName: string;
  previousApprovedRequest:
    | AdditionalSalaryRequestsQuery['additionalSalaryRequests']['nodes'][number]
    | undefined;
  requestData?: AdditionalSalaryRequestQuery['additionalSalaryRequest'] | null;
  requestError?: ApolloError;

  requestsData?:
    | AdditionalSalaryRequestsQuery['additionalSalaryRequests']['nodes']
    | null;
  requestsError?: ApolloError;
  requestId?: string;
  createAdditionalSalaryRequest: ReturnType<
    typeof useCreateAdditionalSalaryRequestMutation
  >[0];
  submitAdditionalSalaryRequest: ReturnType<
    typeof useSubmitAdditionalSalaryRequestMutation
  >[0];
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

  const { data: requestData, error: requestError } =
    useAdditionalSalaryRequestQuery({
      variables: { requestId: requestId || '' },
      skip: !requestId,
    });

  const [createAdditionalSalaryRequest] =
    useCreateAdditionalSalaryRequestMutation();

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

  const defaultInitialValues: CompleteFormValues = {
    currentYearSalaryNotReceived: '0',
    previousYearSalaryNotReceived: '0',
    additionalSalaryWithinMax: '0',
    adoption: '0',
    traditional403bContribution: '0',
    counselingNonMedical: '0',
    healthcareExpensesExceedingLimit: '0',
    babysittingMinistryEvents: '0',
    childrenMinistryTripExpenses: '0',
    childrenCollegeEducation: '0',
    movingExpense: '0',
    seminary: '0',
    housingDownPayment: '0',
    autoPurchase: '0',
    expensesNotApprovedWithin90Days: '0',
    deductTwelvePercent: false,
    phoneNumber: '',
  };

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
      currentYearSalaryNotReceived: String(request.currentYearSalaryNotReceived || 0),
      previousYearSalaryNotReceived: String(request.previousYearSalaryNotReceived || 0),
      additionalSalaryWithinMax: String(request.additionalSalaryWithinMax || 0),
      adoption: String(request.adoption || 0),
      traditional403bContribution: String(request.traditional403bContribution || 0),
      counselingNonMedical: String(request.counselingNonMedical || 0),
      healthcareExpensesExceedingLimit: String(request.healthcareExpensesExceedingLimit || 0),
      babysittingMinistryEvents: String(request.babysittingMinistryEvents || 0),
      childrenMinistryTripExpenses: String(request.childrenMinistryTripExpenses || 0),
      childrenCollegeEducation: String(request.childrenCollegeEducation || 0),
      movingExpense: String(request.movingExpense || 0),
      seminary: String(request.seminary || 0),
      housingDownPayment: String(request.housingDownPayment || 0),
      autoPurchase: String(request.autoPurchase || 0),
      expensesNotApprovedWithin90Days: String(
        request.expensesNotApprovedWithin90Days || 0,
      ),
      deductTwelvePercent: request.deductTwelvePercent || false,
      phoneNumber: request.phoneNumber || '',
    };
  }, [providedInitialValues, requestData]);

  const validationSchema = useMemo(
    () =>
      yup.object({
        currentYearSalaryNotReceived: createCurrencyValidation(t("Current Year's Salary")),
        previousYearSalaryNotReceived: createCurrencyValidation(
          t("Previous Year's Salary"),
        ),
        additionalSalaryWithinMax: createCurrencyValidation(t('Additional Salary')),
        adoption: createCurrencyValidation(t('Adoption'), 15000), // replace with MpdGoalMiscConstants value when possible
        traditional403bContribution: createCurrencyValidation(t('403(b) Contribution')), // Can't be greater than salary (will be pulled from HCM)
        counselingNonMedical: createCurrencyValidation(t('Counseling')),
        healthcareExpensesExceedingLimit: createCurrencyValidation(t('Healthcare Expenses')),
        babysittingMinistryEvents: createCurrencyValidation(t('Babysitting')),
        childrenMinistryTripExpenses: createCurrencyValidation(
          t("Children's Ministry Trip"),
        ), // Need to pull number of children from HCM and multiply by 21000 for max
        childrenCollegeEducation: createCurrencyValidation(t("Children's College")),
        movingExpense: createCurrencyValidation(t('Moving Expense')),
        seminary: createCurrencyValidation(t('Seminary')),
        housingDownPayment: createCurrencyValidation(
          t('Housing Down Payment'),
          50000,
        ), // replace with MpdGoalMiscConstants value when possible
        autoPurchase: createCurrencyValidation(t('Auto Purchase')), // Max will eventually be a constant, no determined value yet
        expensesNotApprovedWithin90Days: createCurrencyValidation(
          t('Reimbursable Expenses'),
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

  const handleCancel = () => {
    // Implement cancel logic here
  };

  const handleSubmit = useCallback(
    (values: CompleteFormValues) => {
      if (!requestId) {
        return;
      }
      // Parse string values to numbers for the GraphQL mutation
      const attributes = {
        currentYearSalaryNotReceived: parseFloat(values.currentYearSalaryNotReceived) || 0,
        previousYearSalaryNotReceived: parseFloat(values.previousYearSalaryNotReceived) || 0,
        additionalSalaryWithinMax: parseFloat(values.additionalSalaryWithinMax) || 0,
        adoption: parseFloat(values.adoption) || 0,
        traditional403bContribution: parseFloat(values.traditional403bContribution) || 0,
        counselingNonMedical: parseFloat(values.counselingNonMedical) || 0,
        healthcareExpensesExceedingLimit: parseFloat(values.healthcareExpensesExceedingLimit) || 0,
        babysittingMinistryEvents: parseFloat(values.babysittingMinistryEvents) || 0,
        childrenMinistryTripExpenses: parseFloat(values.childrenMinistryTripExpenses) || 0,
        childrenCollegeEducation: parseFloat(values.childrenCollegeEducation) || 0,
        movingExpense: parseFloat(values.movingExpense) || 0,
        seminary: parseFloat(values.seminary) || 0,
        housingDownPayment: parseFloat(values.housingDownPayment) || 0,
        autoPurchase: parseFloat(values.autoPurchase) || 0,
        expensesNotApprovedWithin90Days: parseFloat(values.expensesNotApprovedWithin90Days) || 0,
        deductTwelvePercent: values.deductTwelvePercent,
        phoneNumber: values.phoneNumber,
        totalAdditionalSalaryRequested: getTotal(values),
      };

      // First update the request with the form values
      updateAdditionalSalaryRequest({
        variables: {
          id: requestId,
          attributes,
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

  const percentComplete = useMemo(
    () => calculateCompletionPercentage(formik.values),
    [formik.values],
  );

  const preferredName = useMemo(
    () => hcmData?.hcm?.[0]?.staffInfo?.preferredName || '',
    [hcmData],
  );

  const spousePreferredName = useMemo(
    () => hcmData?.hcm?.[1]?.staffInfo?.preferredName || '',
    [hcmData],
  );

  const nodes = requestsData?.additionalSalaryRequests?.nodes;

  const previousApprovedRequest = nodes
    ?.slice(1)
    ?.find((request) => request.status === AsrStatusEnum.Approved);

  const contextValue = useMemo<AdditionalSalaryRequestType>(
    () => ({
      steps,
      currentIndex,
      percentComplete,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      setIsDrawerOpen,
      handleCancel,
      hcmUser: hcmData?.hcm?.[0] ?? null,
      hcmSpouse: hcmData?.hcm?.[1] ?? null,
      isMarried: !!hcmData?.hcm?.[1],
      preferredName,
      spousePreferredName,
      previousApprovedRequest,
      requestsData: requestsData?.additionalSalaryRequests?.nodes,
      requestData: requestData?.additionalSalaryRequest,
      requestsError,
      requestError,
      requestId,
      createAdditionalSalaryRequest,
      submitAdditionalSalaryRequest,
    }),
    [
      steps,
      currentIndex,
      percentComplete,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      hcmData,
      requestsData,
      requestData,
      requestsError,
      requestError,
      requestId,
      createAdditionalSalaryRequest,
      submitAdditionalSalaryRequest,
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
