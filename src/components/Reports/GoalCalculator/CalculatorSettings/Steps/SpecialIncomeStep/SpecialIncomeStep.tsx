import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { SpecialIncomeStepForm } from './SpecialIncomeStepForm/SpecialIncomeStepForm';

interface SpecialIncomeStepProps {}

interface SpecialIncomeFormValues {
  // Special income fields
  incidentIncome: number;
  propertyIncome: number;
  additionalIncomes: Array<{
    label: string;
    amount: number;
  }>;
}

export const SpecialIncomeStep: React.FC<SpecialIncomeStepProps> = () => {
  const initialValues: SpecialIncomeFormValues = {
    incidentIncome: 0,
    propertyIncome: 0,
    additionalIncomes: [],
  };

  const validationSchema = Yup.object().shape({
    incidentIncome: Yup.number()
      .min(0, 'Incident income must be positive')
      .required('Incident income is required'),
    propertyIncome: Yup.number()
      .min(0, 'Property income must be positive')
      .required('Property income is required'),
    additionalIncomes: Yup.array().of(
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

  const handleSubmit = (_values: SpecialIncomeFormValues) => {
    // Handle form submission here
    // TODO: Implement form submission logic
  };

  return (
    <Box sx={{ p: 1 }}>
      <Container disableGutters sx={{ p: 1 }}>
        <Typography sx={{ flex: '1 1 100%', mb: 2 }} component="p">
          Do you have any additional sources of income?
        </Typography>

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
      </Container>
    </Box>
  );
};
