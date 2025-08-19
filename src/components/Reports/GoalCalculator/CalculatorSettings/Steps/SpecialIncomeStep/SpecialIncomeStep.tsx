import React from 'react';
import { Typography, styled } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { SpecialIncomeStepForm } from './SpecialIncomeStepForm/SpecialIncomeStepForm';

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface SpecialIncomeStepProps {}

interface SpecialIncomeFormValues {
  // Special income fields
  incidentalIncome: number;
  propertyIncome: number;
  spouseIncome: number;
  additionalIncomes: Array<{
    label: string;
    amount: number;
  }>;
}

export const SpecialIncomeStep: React.FC<SpecialIncomeStepProps> = () => {
  const { handleContinue } = useGoalCalculator();
  const { t } = useTranslation();
  const initialValues: SpecialIncomeFormValues = {
    incidentalIncome: 0,
    propertyIncome: 0,
    spouseIncome: 0,
    additionalIncomes: [],
  };

  const validationSchema = yup.object({
    incidentalIncome: yup
      .number()
      .min(0, t('Incident income must be positive'))
      .required(t('Incident income is required')),
    propertyIncome: yup
      .number()
      .min(0, t('Property income must be positive'))
      .required(t('Property income is required')),
    spouseIncome: yup.number().min(0, t('Spouse income must be positive')),
    additionalIncomes: yup.array().of(
      yup.object({
        label: yup
          .string()
          .min(2, t('Label must be at least 2 characters'))
          .required(t('Label is required')),
        amount: yup
          .number()
          .min(0, t('Amount must be positive'))
          .required(t('Amount is required')),
      }),
    ),
  });

  const handleSubmit = () => {
    // Handle form submission here
    // TODO: Implement form submission logic
    handleContinue();
  };

  return (
    <>
      <StyledTypography>
        {t(
          'Do you have any additional sources of income? If you have income from outside sources (other than Cru) that you use as part of your budget, please include it below. Please enter the NET amounts used in your monthly budget.',
        )}
      </StyledTypography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form>
          <SpecialIncomeStepForm />
        </Form>
      </Formik>
    </>
  );
};
