import React, { useState } from 'react';
import { Box, Card, Container, Tab, Tabs, Typography } from '@mui/material';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { InformationStepFinancialForm } from './InformationStepForm/InformationStepFinancialForm';
import { InformationStepPersonalForm } from './InformationStepForm/InformationStepPersonalForm';

interface InformationStepProps {}

interface InformationFormValues {
  // Financial form fields
  monthlyIncome: number;
  monthlyExpenses: number;
  targetAmount: number;
  monthlySalary: number;
  taxes: number;
  secaStatus: string;
  contribution403b: number;
  mhaAmountPerMonth: number;
  solidMonthlySupportDeveloped: number;

  // Personal form fields
  location: string;
  role: string;
  benefits: string;
  tenure: number;
  age: number;
  children: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

export const InformationStep: React.FC<InformationStepProps> = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const initialValues: InformationFormValues = {
    // Financial form initial values
    monthlyIncome: 0,
    monthlyExpenses: 0,
    targetAmount: 0,
    monthlySalary: 0,
    taxes: 0,
    secaStatus: '',
    contribution403b: 0,
    mhaAmountPerMonth: 0,
    solidMonthlySupportDeveloped: 0,

    // Personal form initial values
    location: '',
    role: '',
    benefits: '',
    tenure: 0,
    age: 0,
    children: 0,
  };

  const validationSchema = Yup.object().shape({
    // Financial validation
    monthlyIncome: Yup.number()
      .min(0, 'Monthly income must be positive')
      .required('Monthly income is required'),
    monthlyExpenses: Yup.number()
      .min(0, 'Monthly expenses must be positive')
      .required('Monthly expenses is required'),
    targetAmount: Yup.number()
      .min(0, 'Target amount must be positive')
      .required('Target amount is required'),
    monthlySalary: Yup.number()
      .min(0, 'Monthly salary must be positive')
      .required('Monthly salary is required'),
    taxes: Yup.number()
      .min(0, 'Taxes must be positive')
      .max(100, 'Taxes cannot exceed 100%')
      .required('Taxes percentage is required'),
    secaStatus: Yup.string()
      .oneOf(
        ['exempt', 'non-exempt'],
        'SECA status must be either exempt or non-exempt',
      )
      .required('SECA status is required'),
    contribution403b: Yup.number()
      .min(0, '403(b) contribution must be positive')
      .required('403(b) contribution is required'),
    mhaAmountPerMonth: Yup.number()
      .min(0, 'MHA amount must be positive')
      .required('MHA amount per month is required'),
    solidMonthlySupportDeveloped: Yup.number()
      .min(0, 'Solid monthly support must be positive')
      .required('Solid monthly support developed is required'),

    // Personal validation
    location: Yup.string()
      .min(2, 'Location must be at least 2 characters')
      .required('Location is required'),
    role: Yup.string()
      .min(2, 'Role must be at least 2 characters')
      .required('Role is required'),
    benefits: Yup.string()
      .min(10, 'Benefits description must be at least 10 characters')
      .required('Benefits information is required'),
    tenure: Yup.number()
      .min(0, 'Tenure must be positive')
      .max(50, 'Tenure cannot exceed 50 years')
      .required('Tenure is required'),
    age: Yup.number()
      .min(18, 'Age must be at least 18')
      .max(100, 'Age cannot exceed 100')
      .required('Age is required'),
    children: Yup.number()
      .min(0, 'Number of children must be positive')
      .max(20, 'Number of children cannot exceed 20')
      .required('Number of children is required'),
  });
  const handleSubmit = (_values: InformationFormValues) => {
    // Handle form submission here
    // TODO: Implement form submission logic
  };

  return (
    <Box sx={{ p: 1 }}>
      <Container disableGutters sx={{ p: 1 }}>
        <Typography sx={{ flex: '1 1 100%', mb: 2 }} component="p">
          Take a moment to verify your information.
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formikProps: FormikProps<InformationFormValues>) => (
            <Form>
              <Card sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="information tabs"
                    sx={{ px: 2 }}
                  >
                    <Tab label="Personal" {...a11yProps(1)} />
                    <Tab label="Financial" {...a11yProps(0)} />
                  </Tabs>
                </Box>

                <TabPanel value={value} index={0}>
                  <InformationStepPersonalForm formikProps={formikProps} />
                </TabPanel>

                <TabPanel value={value} index={1}>
                  <InformationStepFinancialForm formikProps={formikProps} />
                </TabPanel>
              </Card>
            </Form>
          )}
        </Formik>
      </Container>
    </Box>
  );
};
