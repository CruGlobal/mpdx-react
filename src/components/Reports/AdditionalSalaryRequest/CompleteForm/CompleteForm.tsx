import React, { useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccountInfoCard } from '../Shared/AccountInfoCard';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestSection } from '../SharedComponents/AdditionalSalaryRequestSection';
import {
  BackButton,
  CancelButton,
  SubmitButton,
} from '../SharedComponents/NavButtons';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest/AdditionalSalaryRequest';
import { Deduction } from './Deduction/Deduction';

export interface CompleteFormValues {
  currentYearSalary: string;
  previousYearSalary: string;
  additionalSalary: string;
  adoption: string;
  contribution403b: string;
  counseling: string;
  healthcareExpenses: string;
  babysitting: string;
  childrenMinistryTrip: string;
  childrenCollege: string;
  movingExpense: string;
  seminary: string;
  housingDownPayment: string;
  autoPurchase: string;
  reimbursableExpenses: string;
  defaultPercentage: boolean;
}

export const CompleteForm: React.FC = () => {
  const { t } = useTranslation();
  const { selectedSection } = useAdditionalSalaryRequest();
  const theme = useTheme();
  const name = 'Doc, John';
  const accountNumber = '00123456';
  const primaryAccountBalance = 20307.58;
  const remainingAllowableSalary = 17500.0;

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
  };

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

  const handleSubmit = (_values: CompleteFormValues) => {
    // TODO: Implement form submission
  };

  return (
    <AdditionalSalaryRequestSection title={selectedSection.title}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <Form>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(4),
              }}
            >
              <AccountInfoCard
                name={name}
                accountNumber={accountNumber}
                primaryAccountBalance={primaryAccountBalance}
                remainingAllowableSalary={remainingAllowableSalary}
              />
              <Typography variant="body1" paragraph>
                {t(
                  'Please enter the desired dollar amounts for the appropriate categories and review totals before submitting. Your Net Additional Salary calculated below represents the amount you will receive (before taxes) in additional salary and equals the amount you are requesting minus any amount being contributed to your 403(b).',
                )}
              </Typography>
              <AdditionalSalaryRequest formikProps={formikProps} />
              <Deduction formikProps={formikProps} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <CancelButton />
                <Box sx={{ display: 'flex', gap: theme.spacing(2) }}>
                  <BackButton />
                  <SubmitButton type="submit" />
                </Box>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </AdditionalSalaryRequestSection>
  );
};
