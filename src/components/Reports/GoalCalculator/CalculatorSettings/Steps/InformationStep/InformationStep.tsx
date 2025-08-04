import React, { useState } from 'react';
import { Box, Card, Tab, Tabs, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { Form, Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { InformationStepFinancialForm } from './InformationStepForm/InformationStepFinancialForm';
import { InformationStepPersonalForm } from './InformationStepForm/InformationStepPersonalForm';

const StyledInfoBox = styled(Box)({
  borderBottom: 1,
  borderColor: 'divider',
});

const StyledCard = styled(Card)({
  width: '100%',
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  flex: '1 1 100%',
  marginBottom: theme.spacing(2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

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

interface InformationStepProps {
  handlePageChange?: (page: string) => void;
}

export const InformationStep: React.FC<InformationStepProps> = () => {
  const { handleContinue } = useGoalCalculator();
  const [value, setValue] = useState(0);
  const { t } = useTranslation();

  const validationSchema = yup.object().shape({
    // Financial validation
    monthlyIncome: yup
      .number()
      .min(0, t('Monthly income must be positive'))
      .required(t('Monthly income is required')),
    monthlyExpenses: yup
      .number()
      .min(0, t('Monthly expenses must be positive'))
      .required(t('Monthly expenses is required')),
    targetAmount: yup
      .number()
      .min(0, t('Target amount must be positive'))
      .required(t('Target amount is required')),
    monthlySalary: yup
      .number()
      .min(0, t('Monthly salary must be positive'))
      .required(t('Monthly salary is required')),
    taxes: yup
      .number()
      .min(0, t('Taxes must be positive'))
      .max(100, t('Taxes cannot exceed 100%'))
      .required(t('Taxes percentage is required')),
    secaStatus: yup
      .string()
      .oneOf(
        ['exempt', 'non-exempt'],
        t('SECA status must be either exempt or non-exempt'),
      )
      .required(t('SECA status is required')),
    contribution403b: yup
      .number()
      .min(0, t('403(b) contribution must be positive'))
      .required(t('403(b) contribution is required')),
    mhaAmountPerMonth: yup
      .number()
      .min(0, t('MHA amount must be positive'))
      .required(t('MHA amount per month is required')),
    solidMonthlySupportDeveloped: yup
      .number()
      .min(0, t('Solid monthly support must be positive'))
      .required(t('Solid monthly support developed is required')),

    // Personal validation
    location: yup
      .string()
      .min(2, t('Location must be at least 2 characters'))
      .required(t('Location is required')),
    role: yup
      .string()
      .min(2, t('Role must be at least 2 characters'))
      .required(t('Role is required')),
    benefits: yup
      .string()
      .min(10, t('Benefits description must be at least 10 characters'))
      .required(t('Benefits information is required')),
    tenure: yup
      .number()
      .min(0, t('Tenure must be positive'))
      .max(50, t('Tenure cannot exceed 50 years'))
      .required(t('Tenure is required')),
    age: yup
      .number()
      .min(18, t('Age must be at least 18'))
      .max(100, t('Age cannot exceed 100'))
      .required(t('Age is required')),
    children: yup
      .number()
      .min(0, t('Number of children must be positive'))
      .max(20, t('Number of children cannot exceed 20'))
      .required(t('Number of children is required')),
  });

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

  const handleSubmit = () => {
    // Handle form submission here
    // TODO: Implement form submission logic

    handleContinue();
  };

  return (
    <>
      <StyledTypography>
        {t('Take a moment to verify your information.')}
      </StyledTypography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps: FormikProps<InformationFormValues>) => (
          <Form>
            <StyledCard>
              <StyledInfoBox>
                <StyledTabs
                  value={value}
                  onChange={handleChange}
                  aria-label={t('information tabs')}
                >
                  <Tab label={t('Personal')} />
                  <Tab label={t('Financial')} />
                </StyledTabs>
              </StyledInfoBox>

              <TabPanel value={value} index={0}>
                <InformationStepPersonalForm formikProps={formikProps} />
              </TabPanel>

              <TabPanel value={value} index={1}>
                <InformationStepFinancialForm formikProps={formikProps} />
              </TabPanel>
            </StyledCard>
          </Form>
        )}
      </Formik>
    </>
  );
};
