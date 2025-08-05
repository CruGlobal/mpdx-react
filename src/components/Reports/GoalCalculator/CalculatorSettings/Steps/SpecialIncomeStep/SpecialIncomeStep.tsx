import React from 'react';
import { Typography, styled } from '@mui/material';
import { Form, Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { SpecialIncomeStepForm } from './SpecialIncomeStepForm/SpecialIncomeStepForm';

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface SpecialIncomeStepProps {}

export interface SpecialIncomeFormValues {
  // Special income fields
  specialIncomeData: Array<{
    id: number;
    name: string;
    amount: number;
  }>;
}

export const SpecialIncomeStep: React.FC<SpecialIncomeStepProps> = () => {
  const { handleContinue } = useGoalCalculator();
  const { t } = useTranslation();
  const initialValues: SpecialIncomeFormValues = {
    specialIncomeData: [
      { id: 1, name: 'Freelance Work', amount: 2500 },
      { id: 2, name: 'Investment Returns', amount: 1200 },
      { id: 3, name: 'Rental Income', amount: 1800 },
    ],
  };

  const validationSchema = yup.object({
    specialIncomeData: yup.array().of(
      yup.object({
        id: yup.number().required(),
        name: yup
          .string()
          .min(2, t('Name must be at least 2 characters'))
          .required(t('Name is required')),
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
        {t('Do you have any additional sources of income?')}
      </StyledTypography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps: FormikProps<SpecialIncomeFormValues>) => (
          <Form>
            <SpecialIncomeStepForm formikProps={formikProps} />
          </Form>
        )}
      </Formik>
    </>
  );
};
