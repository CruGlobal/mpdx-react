import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Form, Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { ContinueButton } from '../../../SharedComponents/ContinueButton';
import { MileageStepForm } from './MileageStepForm/MileageStepForm';

interface MileageStepProps {}

interface MileageStepFormValues {
  // Mileage entries
  additionalMileage: Array<{
    label: string;
    amount: number;
  }>;
}

export const MileageStep: React.FC<MileageStepProps> = () => {
  const { t } = useTranslation();
  const { handleContinue } = useGoalCalculator();
  const initialValues: MileageStepFormValues = {
    additionalMileage: [],
  };

  const validationSchema = yup.object().shape({
    additionalMileage: yup.array().of(
      yup.object().shape({
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
    <Box sx={{ p: 1 }}>
      <Container disableGutters sx={{ p: 1 }}>
        <Typography sx={{ flex: '1 1 100%', mb: 2 }} component="p">
          {t('What are your mileage expenses?')}
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formikProps: FormikProps<MileageStepFormValues>) => (
            <Form>
              <MileageStepForm formikProps={formikProps} />
            </Form>
          )}
        </Formik>
      </Container>
      <ContinueButton onClick={handleSubmit} />
    </Box>
  );
};
