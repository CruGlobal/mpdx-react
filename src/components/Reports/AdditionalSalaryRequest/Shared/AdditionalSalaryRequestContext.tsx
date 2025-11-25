import React, { createContext, useCallback, useMemo, useState } from 'react';
import { FormikProps, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  AdditionalSalaryRequestSectionEnum,
  SectionOrderItem,
} from '../AdditionalSalaryRequestHelper';
import { CompleteFormValues } from '../CompleteForm/CompleteForm';
import { useFormCompletionPercentage } from './useFormCompletionPercentage';

export type AdditionalSalaryRequestType = {
  sectionOrder: SectionOrderItem[];
  selectedSection: SectionOrderItem;
  handleContinue: () => void;
  setSectionIndex: (number) => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  handleCancel: () => void;
  handleBack: () => void;
  percentComplete: number;
  formik: FormikProps<CompleteFormValues>;
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
}

export const AdditionalSalaryRequestProvider: React.FC<Props> = ({
  children,
}) => {
  const { t } = useTranslation();
  // Translated titles should be used when rendering
  const sectionOrder = useMemo<SectionOrderItem[]>(
    () => [
      {
        title: t('About this Form'),
        section: AdditionalSalaryRequestSectionEnum.AboutForm,
      },
      {
        title: t('Complete the Form'),
        section: AdditionalSalaryRequestSectionEnum.CompleteForm,
      },
      {
        title: t('Receipt'),
        section: AdditionalSalaryRequestSectionEnum.Receipt,
      },
    ],
    [t],
  );
  const [sectionIndex, setSectionIndex] = useState(0);
  const selectedSection = sectionOrder[sectionIndex];
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const createCurrencyValidation = useCallback(
    (fieldName: string, max?: number) => {
      let schema = yup
        .number()
        .min(0, t('{{field}} amount must be positive', { field: fieldName }))
        .required(t('{{field}} field is required', { field: fieldName }));
      if (max) {
        schema = schema.max(
          max,
          t('Exceeds ${{amount}} limit', { amount: max.toLocaleString() }),
        );
      }
      return schema;
    },
    [t],
  );

  const initialValues: CompleteFormValues = useMemo(
    () => ({
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
    }),
    [],
  );

  const validationSchema = useMemo(
    () =>
      yup.object({
        currentYearSalary: createCurrencyValidation("Current Year's Salary"),
        previousYearSalary: createCurrencyValidation("Previous Year's Salary"),
        additionalSalary: createCurrencyValidation('Additional Salary'),
        adoption: createCurrencyValidation('Adoption', 15000), // replace with MpdGoalMiscConstants value when possible
        contribution403b: createCurrencyValidation('403(b) Contribution'), // Can't be greater than salary (will be pulled from HCM)
        counseling: createCurrencyValidation('Counseling'),
        healthcareExpenses: createCurrencyValidation('Healthcare Expenses'),
        babysitting: createCurrencyValidation('Babysitting'),
        childrenMinistryTrip: createCurrencyValidation(
          "Children's Ministry Trip",
        ), // Need to pull number of children from HCM and multiply by 21000 for max
        childrenCollege: createCurrencyValidation("Children's College"),
        movingExpense: createCurrencyValidation('Moving Expense'),
        seminary: createCurrencyValidation('Seminary'),
        housingDownPayment: createCurrencyValidation(
          'Housing Down Payment',
          50000,
        ), // replace with MpdGoalMiscConstants value when possible
        autoPurchase: createCurrencyValidation('Auto Purchase'), // Max will eventually be a constant, no determined value yet
        reimbursableExpenses: createCurrencyValidation('Reimbursable Expenses'),
        defaultPercentage: yup.boolean(),
      }),
    [createCurrencyValidation],
  );

  const handleSubmit = useCallback((_values: CompleteFormValues) => {
    //TODO: Submit form values
  }, []);

  const formik = useFormik<CompleteFormValues>({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  const percentComplete = useFormCompletionPercentage(formik.values);

  const handleContinue = useCallback(() => {
    if (sectionIndex < sectionOrder.length - 1) {
      setSectionIndex(sectionIndex + 1);
    }
  }, [sectionIndex, sectionOrder.length]);

  const handleCancel = useCallback(() => {
    setSectionIndex(0);
  }, []);

  const handleBack = useCallback(() => {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1);
    }
  }, [sectionIndex]);

  const contextValue = useMemo<AdditionalSalaryRequestType>(
    () => ({
      sectionOrder,
      setSectionIndex,
      selectedSection,
      handleContinue,
      isDrawerOpen,
      toggleDrawer,
      setIsDrawerOpen,
      handleCancel,
      handleBack,
      percentComplete,
      formik,
    }),
    [
      sectionOrder,
      selectedSection,
      handleContinue,
      handleCancel,
      handleBack,
      isDrawerOpen,
      toggleDrawer,
      percentComplete,
      formik,
    ],
  );

  return (
    <AdditionalSalaryRequestContext.Provider value={contextValue}>
      {children}
    </AdditionalSalaryRequestContext.Provider>
  );
};
