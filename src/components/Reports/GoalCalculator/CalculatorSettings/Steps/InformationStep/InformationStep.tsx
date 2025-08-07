import React, { useMemo, useState } from 'react';
import RightArrowIcon from '@mui/icons-material/ArrowForward';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import {
  Avatar,
  Box,
  Button,
  Card,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { InformationStepFinancialForm } from './InformationStepForm/InformationStepFinancialForm';
import { InformationStepPersonalForm } from './InformationStepForm/InformationStepPersonalForm';
import { BenefitsPlan, Role } from './InformationStepForm/enums';
import {
  ageOptions,
  familySizeOptions,
  tenureOptions,
} from './InformationStepForm/mockData';

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
  paycheckAmount: number;
  taxes: number;
  secaStatus: string;
  contributionRoth403b: number;
  contributionTraditional403b: number;
  mhaAmountPerPaycheck: number;

  // Personal form fields
  firstName: string;
  lastName: string;
  geographicLocation: string;
  location: string;
  role: string;
  benefits: string;
  familySize: string;
  tenure: string;
  age: string;
  children: string;
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
  const { data: userData } = useGetUserQuery();

  const validationSchema = yup.object({
    // Financial validation
    paycheckAmount: yup
      .number()
      .min(0, t('Paycheck amount must be positive'))
      .required(t('Paycheck amount is required')),
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
    contributionRoth403b: yup
      .number()
      .min(0, t('Roth 403(b) contribution must be positive'))
      .optional(),
    contributionTraditional403b: yup
      .number()
      .min(0, t('Traditional 403(b) contribution must be positive'))
      .optional(),
    mhaAmountPerPaycheck: yup
      .number()
      .min(0, t('MHA amount per paycheck must be positive'))
      .optional(),

    // Personal validation
    firstName: yup.string().required(t('First name is required')),
    lastName: yup.string().required(t('Last name is required')),
    geographicLocation: yup
      .string()
      .required(t('Geographic location is required')),
    role: yup
      .string()
      .oneOf(Object.values(Role), t('Role must be one of the options'))
      .required(t('Role is required')),
    location: yup.string().required(t('Location is required')),
    benefits: yup
      .string()
      .oneOf(
        Object.values(BenefitsPlan),
        t('Benefits plan must be one of the options'),
      )
      .required(t('Benefits plan is required')),
    familySize: yup
      .string()
      .oneOf(familySizeOptions, t('Family size must be one of the options'))
      .required(t('Family size is required')),
    tenure: yup
      .string()
      .oneOf(tenureOptions, t('Years on staff must be one of the options'))
      .required(t('Years on staff is required')),
    age: yup
      .string()
      .oneOf(ageOptions, t('Age range must be one of the options'))
      .required(t('Age is required')),
    children: yup.string().optional(),
  });

  /* Initially pick was used here, but certain fields
   * like tenure may not be required for a spouse.
   */
  const spouseValidationSchema = yup.object(
    Object.fromEntries(
      [
        'firstName',
        'lastName',
        'paycheckAmount',
        'taxes',
        'secaStatus',
        'contributionRoth403b',
        'mhaAmountPerPaycheck',
        'contributionTraditional403b',
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
    paycheckAmount: 0,
    taxes: 0,
    secaStatus: '',
    contributionRoth403b: 0,
    contributionTraditional403b: 0,
    mhaAmountPerPaycheck: 0,

    // Personal form initial values
    firstName: userData?.user?.firstName || '',
    lastName: userData?.user?.lastName || '',
    geographicLocation: '',
    location: '',
    role: '',
    benefits: '',
    familySize: '',
    tenure: '',
    age: '',
    children: '',
  };

  const initialSpouseValues: Partial<InformationFormValues> = {
    // Financial form initial values for spouse
    paycheckAmount: 0,
    taxes: 0,
    secaStatus: '',
    contributionRoth403b: 0,
    contributionTraditional403b: 0,
    mhaAmountPerPaycheck: 0,

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
  const buttonText = useMemo(() => {
    if (!spouseInformation) {
      return t('View Spouse');
    }
    if (userData?.user?.firstName) {
      return `${t('View')} ${userData.user.firstName}`;
    }
    return t('View Your Information');
  }, [spouseInformation, userData?.user?.firstName, t]);

  const onClickSpouseInformation = () => {
    setSpouseInformation(!spouseInformation);
  };

  return (
    <>
      <StyledTypography data-testid="verify-info-typography">
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
            {userData?.user ? (
              <Avatar
                data-testid="info-avatar"
                src={userData.user.avatar}
                alt={userData.user.firstName ?? t('User')}
                variant="rounded"
                sx={{ width: 36, height: 36, marginRight: 1 }}
              />
            ) : (
              <Avatar variant="rounded" />
            )}
            <Typography data-testid="info-name-typography">
              {userData?.user.firstName ?? t('User')}
            </Typography>
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
                      data-testid="personal-tab"
                      iconPosition={'start'}
                      icon={<PersonIcon />}
                      label={t('Personal')}
                    />
                    <Tab
                      data-testid="financial-tab"
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
                    <Tab
                      data-testid="spouse-personal-tab"
                      iconPosition={'start'}
                      icon={<PersonIcon />}
                      label={t("Spouse's Personal")}
                    />
                    <Tab
                      data-testid="spouse-financial-tab"
                      iconPosition={'start'}
                      icon={<CreditCardIcon />}
                      label={t("Spouse's Financial")}
                    />
                  </StyledTabs>
                </StyledInfoBox>

                <TabPanel value={value} index={0}>
                  <InformationStepPersonalForm isSpouse />
                </TabPanel>

                <TabPanel value={value} index={1}>
                  {/* isSpouse logic does not currently need to be handled in
                  InformationStepFinancialForm but it's worth passing
                  in the event we do make changes */}
                  <InformationStepFinancialForm isSpouse />
                </TabPanel>
              </StyledCard>
            </Form>
          </Formik>
        )}
      </StyledCard>
    </>
  );
};
