import React, { useState } from 'react';
import RightArrowIcon from '@mui/icons-material/ArrowForward';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import {
  Box,
  Button,
  Card,
  Container,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import theme from 'src/theme';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { ContinueButton } from '../../../SharedComponents/ContinueButton';
import { InformationStepFinancialForm } from './InformationStepForm/InformationStepFinancialForm';
import { InformationStepPersonalForm } from './InformationStepForm/InformationStepPersonalForm';
import { SpouseInformationStepFinancialForm } from './InformationStepForm/SpouseInformationStepFinancialForm';
import { SpouseInformationStepPersonalForm } from './InformationStepForm/SpouseInformationStepFormPersonal';
import {
  Age,
  BenefitsPlan,
  FamilySize,
  Role,
  Tenure,
} from './InformationStepForm/enums';

const StyledBox = styled(Box)({
  padding: theme.spacing(1),
});

const StyledInfoBox = styled(Box)({
  borderBottom: 1,
  borderColor: 'divider',
});

const StyledCard = styled(Card)({
  width: '100%',
});

const StyledTypography = styled(Typography)({
  flex: '1 1 100%',
  marginBottom: theme.spacing(2),
});

const StyledTabs = styled(Tabs)({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
});

const StyledContainer = styled(Container)({
  padding: theme.spacing(1),
});

const StyledPersonBox = styled(Box)({
  width: 36,
  height: 36,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export interface InformationFormValues {
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
  familySize: string;
  tenure: string;
  age: string;
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

  const validationSchema = yup.object({
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
    location: yup.string().required(t('Location is required')),
    role: yup
      .string()
      .oneOf(Object.values(Role), t('Role must be one of the options'))
      .required(t('Role is required')),
    benefits: yup
      .string()
      .oneOf(
        Object.values(BenefitsPlan),
        t('Benefits plan must be one of the options'),
      )
      .required(t('Benefits plan is required')),
    familySize: yup
      .string()
      .oneOf(
        Object.values(FamilySize),
        t('Family size must be one of the options'),
      )
      .required(t('Family size is required')),
    tenure: yup
      .string()
      .oneOf(Object.values(Tenure), t('Tenure must be one of the options'))
      .required(t('Tenure is required')),
    age: yup
      .string()
      .oneOf(Object.values(Age), t('Age range must be one of the options'))
      .required(t('Age is required')),
  });

  /* Initially pick was used here, but certain fields
   * like tenure may not be required for a spouse.
   */
  const spouseValidationSchema = yup.object(
    Object.fromEntries(
      [
        'monthlyIncome',
        'monthlyExpenses',
        'targetAmount',
        'monthlySalary',
        'taxes',
        'secaStatus',
        'contribution403b',
        'tenure',
        'age',
      ].map((field) => [field, validationSchema.fields[field].notRequired()]),
    ),
  );

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
    location: 'None',
    role: '',
    benefits: '',
    familySize: '',
    tenure: '',
    age: '',
  };

  const initialSpouseValues: Partial<InformationFormValues> = {
    // Financial form initial values for spouse
    monthlyIncome: 0,
    monthlyExpenses: 0,
    targetAmount: 0,
    monthlySalary: 0,
    taxes: 0,
    secaStatus: '',
    contribution403b: 0,
    mhaAmountPerMonth: 0,

    // Personal form initial values for spouse
    role: '',
    tenure: '',
    age: '',
  };

  const handleSubmit = () => {
    // Handle form submission here
    // TODO: Implement form submission logic

    handleContinue();
  };

  // Someone may or may not have a spouse,
  // set to null until query when we have real data
  const [spouseInformation, setSpouseInformation] = useState<boolean | null>(
    false,
  );
  const [buttonText, setButtonText] = useState<string>(t('View Spouse'));
  const onClickSpouseInformation = () => {
    setSpouseInformation(!spouseInformation);
    // Change 'Spouse' here to be actual spouse's name if available
    setButtonText(
      spouseInformation ? t('View Spouse') : t('View Your Information'),
    );
  };

  return (
    <StyledBox>
      <StyledContainer disableGutters>
        <StyledTypography>
          {t('Take a moment to verify your information.')}
        </StyledTypography>
        <StyledCard>
          <Box
            display="flex"
            gap={2}
            m={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={1}
            >
              {/* Replace with user image when we have data */}
              <StyledPersonBox>
                <PersonIcon
                  sx={{ fontSize: 40, color: theme.palette.primary.main }}
                />
              </StyledPersonBox>
              <Typography align="center">{"User's name"}</Typography>
            </Box>
            {spouseInformation !== null && (
              <Button
                endIcon={<RightArrowIcon />}
                onClick={onClickSpouseInformation}
              >
                {buttonText}
              </Button>
            )}
          </Box>

          {!spouseInformation && (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              <Form>
                <StyledCard>
                  <StyledInfoBox>
                    <StyledTabs
                      value={value}
                      onChange={handleChange}
                      aria-label={t('information tabs')}
                    >
                      <Tab
                        iconPosition={'start'}
                        icon={<PersonIcon />}
                        label={t('Personal')}
                      />
                      <Tab
                        iconPosition={'start'}
                        icon={<CreditCardIcon />}
                        label={t('Financial')}
                      />
                    </StyledTabs>
                  </StyledInfoBox>

                  <TabPanel value={value} index={0}>
                    <InformationStepPersonalForm />
                  </TabPanel>

                  <TabPanel value={value} index={1}>
                    <InformationStepFinancialForm />
                  </TabPanel>
                </StyledCard>
              </Form>
            </Formik>
          )}

          {spouseInformation && (
            <Formik
              initialValues={initialSpouseValues}
              validationSchema={spouseValidationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              <Form>
                <StyledCard>
                  <StyledInfoBox>
                    <StyledTabs
                      value={value}
                      onChange={handleChange}
                      aria-label={t('information tabs')}
                    >
                      <Tab label={t("Spouse's Personal")} />
                      <Tab label={t("Spouse's Financial")} />
                    </StyledTabs>
                  </StyledInfoBox>

                  <TabPanel value={value} index={0}>
                    <SpouseInformationStepPersonalForm />
                  </TabPanel>

                  <TabPanel value={value} index={1}>
                    <SpouseInformationStepFinancialForm />
                  </TabPanel>
                </StyledCard>
              </Form>
            </Formik>
          )}
        </StyledCard>
      </StyledContainer>
      <ContinueButton onClick={handleSubmit} />
    </StyledBox>
  );
};
