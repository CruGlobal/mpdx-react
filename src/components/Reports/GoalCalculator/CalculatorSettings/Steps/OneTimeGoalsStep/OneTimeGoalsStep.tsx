import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { OneTimeGoalsStepForm } from './OneTimeGoalsStepForm/OneTimeGoalsStepForm';

interface OneTimeGoalsStepProps {}

interface OneTimeGoalsFormValues {
  // One-time goals fields
  additionalGoals: Array<{
    label: string;
    amount: number;
  }>;
}

export const OneTimeGoalsStep: React.FC<OneTimeGoalsStepProps> = () => {
  const initialValues: OneTimeGoalsFormValues = {
    additionalGoals: [],
  };

  const validationSchema = Yup.object().shape({
    additionalGoals: Yup.array().of(
      Yup.object().shape({
        label: Yup.string()
          .min(2, 'Label must be at least 2 characters')
          .required('Label is required'),
        amount: Yup.number()
          .min(0, 'Amount must be positive')
          .required('Amount is required'),
      }),
    ),
  });

  const handleSubmit = (_values: OneTimeGoalsFormValues) => {
    // Handle form submission here
    // TODO: Implement form submission logic
  };

  return (
    <Box sx={{ p: 1 }}>
      <Container disableGutters sx={{ p: 1 }}>
        <Typography sx={{ flex: '1 1 100%', mb: 2 }} component="p">
          What are your one-time financial goals?
        </Typography>

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
      </Container>
    </Box>
  );
};
