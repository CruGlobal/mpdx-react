import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { Form, Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { ContinueButton } from '../../../SharedComponents/ContinueButton';
import { OneTimeGoalsStepForm } from './OneTimeGoalsStepForm/OneTimeGoalsStepForm';

const StyledTypography = styled(Typography)(({ theme }) => ({
  flex: '1 1 100%',
  marginBottom: theme.spacing(2),
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

interface OneTimeGoalsStepProps {}

interface OneTimeGoalsFormValues {
  // One-time goals fields
  additionalGoals: Array<{
    label: string;
    amount: number;
  }>;
}

export const OneTimeGoalsStep: React.FC<OneTimeGoalsStepProps> = () => {
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
    <StyledBox>
      <StyledContainer disableGutters>
        <StyledTypography>
          {t('What are your one-time financial goals?')}
        </StyledTypography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formikProps: FormikProps<OneTimeGoalsFormValues>) => (
            <Form>
              <OneTimeGoalsStepForm formikProps={formikProps} />
            </Form>
          )}
        </Formik>
      </StyledContainer>
      <ContinueButton onClick={handleSubmit} />
    </StyledBox>
  );
};
