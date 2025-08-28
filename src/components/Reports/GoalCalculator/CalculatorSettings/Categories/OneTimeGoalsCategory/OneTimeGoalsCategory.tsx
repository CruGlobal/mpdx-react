import React from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { StyledTypography } from '../../../SharedComponents/styledComponents/StyledTypography';
import { OneTimeGoalsCategoryForm } from './OneTimeGoalsCategoryForm/OneTimeGoalsCategoryForm';

interface OneTimeGoalsCategoryProps {}

interface OneTimeGoalsFormValues {
  // One-time goals fields
  additionalGoals: Array<{
    label: string;
    amount: number;
  }>;
}

export const OneTimeGoalsCategory: React.FC<OneTimeGoalsCategoryProps> = () => {
  const { handleContinue } = useGoalCalculator();
  const initialValues: OneTimeGoalsFormValues = {
    additionalGoals: [],
  };
  const { t } = useTranslation();

  const validationSchema = yup.object({
    additionalGoals: yup.array().of(
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
        {t('What are your one-time financial goals?')}
      </StyledTypography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form>
          <OneTimeGoalsCategoryForm />
        </Form>
      </Formik>
    </>
  );
};
