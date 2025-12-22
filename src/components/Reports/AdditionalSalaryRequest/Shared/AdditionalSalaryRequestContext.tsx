import React, { createContext, useCallback, useMemo, useState } from 'react';
import { FormikProvider, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { useStepList } from 'src/hooks/useStepList';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import { FormEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import {
  HcmDataQuery,
  useHcmDataQuery,
} from '../../Shared/HcmData/HCMData.generated';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
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
}

const objects = Object.values(AdditionalSalaryRequestSectionEnum);

export const AdditionalSalaryRequestProvider: React.FC<Props> = ({
  children,
  initialValues: providedInitialValues,
}) => {
  const { t } = useTranslation();
  const { steps, nextStep, previousStep, currentIndex } = useStepList(
    FormEnum.AdditionalSalary,
  );
  const locale = useLocale();

  const { data: hcmData } = useHcmDataQuery();

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

  const initialValues: CompleteFormValues = {
    currentYearSalary: '0',
    previousYearSalary: '0',
    additionalSalary: '0',
    adoption: '0',
    contribution403b: '0',
    counseling: '0',
    healthcareExpenses: '0',
    babysitting: '0',
    childrenMinistryTrip: '0',
    childrenCollege: '0',
    movingExpense: '0',
    seminary: '0',
    housingDownPayment: '0',
    autoPurchase: '0',
    reimbursableExpenses: '0',
    defaultPercentage: false,
    telephoneNumber: '',
  };

  const validationSchema = useMemo(
    () =>
      yup.object({
        currentYearSalary: createCurrencyValidation(t("Current Year's Salary")),
        previousYearSalary: createCurrencyValidation(
          t("Previous Year's Salary"),
        ),
        additionalSalary: createCurrencyValidation(t('Additional Salary')),
        adoption: createCurrencyValidation(t('Adoption'), 15000), // replace with MpdGoalMiscConstants value when possible
        contribution403b: createCurrencyValidation(t('403(b) Contribution')), // Can't be greater than salary (will be pulled from HCM)
        counseling: createCurrencyValidation(t('Counseling')),
        healthcareExpenses: createCurrencyValidation(t('Healthcare Expenses')),
        babysitting: createCurrencyValidation(t('Babysitting')),
        childrenMinistryTrip: createCurrencyValidation(
          t("Children's Ministry Trip"),
        ), // Need to pull number of children from HCM and multiply by 21000 for max
        childrenCollege: createCurrencyValidation(t("Children's College")),
        movingExpense: createCurrencyValidation(t('Moving Expense')),
        seminary: createCurrencyValidation(t('Seminary')),
        housingDownPayment: createCurrencyValidation(
          t('Housing Down Payment'),
          50000,
        ), // replace with MpdGoalMiscConstants value when possible
        autoPurchase: createCurrencyValidation(t('Auto Purchase')), // Max will eventually be a constant, no determined value yet
        reimbursableExpenses: createCurrencyValidation(
          t('Reimbursable Expenses'),
        ),
        defaultPercentage: yup.boolean(),
        telephoneNumber: yup
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
    (_values: CompleteFormValues) => {
      //TODO: Submit form values
      handleNextStep();
    },
    [handleNextStep],
  );

  const formik = useFormik<CompleteFormValues>({
    initialValues: providedInitialValues || initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  const percentComplete = useMemo(
    () => calculateCompletionPercentage(formik.values),
    [formik.values],
  );

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
