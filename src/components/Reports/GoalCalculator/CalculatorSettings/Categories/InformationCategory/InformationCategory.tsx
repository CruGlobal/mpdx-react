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
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
} from 'src/graphql/types.generated';
import { InformationCategoryFinancialForm } from './InformationCategoryForm/InformationCategoryFinancialForm';
import { InformationCategoryPersonalForm } from './InformationCategoryForm/InformationCategoryPersonalForm';
import { amount, integer, percentage } from './schema';

const StyledInfoBox = styled(Box)({
  borderBottom: 1,
  borderColor: 'divider',
});

const StyledCard = styled(Card)({
  width: '100%',
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

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

interface InformationCategoryProps {
  handlePageChange?: (page: string) => void;
}

export const InformationCategory: React.FC<InformationCategoryProps> = () => {
  const [value, setValue] = useState(0);
  const { t } = useTranslation();
  const { data: userData } = useGetUserQuery();

  const validationSchema = useMemo(
    () =>
      yup.object({
        // Personal validation
        firstName: yup.string(),
        spouseFirstName: yup.string(),
        lastName: yup.string(),
        geographicLocation: yup.string(),
        role: yup
          .string()
          .oneOf(
            Object.values(GoalCalculationRole),
            t('Role must be one of the options'),
          ),
        ministryLocation: yup.string(),
        familySize: yup
          .string()
          .oneOf(
            Object.values(MpdGoalBenefitsConstantSizeEnum),
            t('Family size must be one of the options'),
          ),
        benefits: yup
          .string()
          .oneOf(
            Object.values(MpdGoalBenefitsConstantPlanEnum),
            t('Benefits plan must be one of the options'),
          ),
        yearsOnStaff: integer(t('Years on Staff'), t),
        spouseYearsOnStaff: integer(t('Spouse Years on Staff'), t),
        age: yup
          .string()
          .oneOf(
            Object.values(GoalCalculationAge),
            t('Age must be one of the options'),
          ),
        spouseAge: yup
          .string()
          .oneOf(
            Object.values(GoalCalculationAge),
            t('Spouse Age must be one of the options'),
          ),
        childrenNamesAges: yup.string(),

        // Financial validation
        netPaycheckAmount: amount(t('Net Paycheck Amount'), t),
        spouseNetPaycheckAmount: amount(t('Spouse Net Paycheck Amount'), t),
        taxesPercentage: percentage(t('Taxes'), t),
        spouseTaxesPercentage: percentage(t('Spouse Taxes'), t),
        secaExempt: yup.boolean(),
        spouseSecaExempt: yup.boolean(),
        rothContributionPercentage: percentage(
          t('Roth 403(b) Contributions'),
          t,
        ),
        spouseRothContributionPercentage: percentage(
          t('Spouse Roth 403(b) Contributions'),
          t,
        ),
        traditionalContributionPercentage: percentage(
          t('Traditional 403(b) Contributions'),
          t,
        ),
        spouseTraditionalContributionPercentage: percentage(
          t('Spouse Traditional 403(b) Contributions'),
          t,
        ),
        mhaAmount: amount(t('MHA Amount Per Paycheck'), t),
        spouseMhaAmount: amount(t('Spouse MHA Amount Per Paycheck'), t),
      }),
    [t],
  );

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
      return t('View {{spouseName}}', { spouseName: userData.user.firstName });
    }
    return t('View Your Information');
  }, [spouseInformation, userData?.user?.firstName, t]);

  const onClickSpouseInformation = () => {
    setSpouseInformation(!spouseInformation);
  };

  return (
    <Formik
      initialValues={{
        geographicLocation: null,
        familySize: '',
        benefitsPlan: '',
      }}
      validationSchema={validationSchema}
      onSubmit={() => {}}
    >
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
              <InformationCategoryPersonalForm schema={validationSchema} />
            </TabPanel>

            <TabPanel value={value} index={1}>
              <InformationCategoryFinancialForm schema={validationSchema} />
            </TabPanel>
          </StyledCard>
        )}

        {spouseInformation && (
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
              <InformationCategoryPersonalForm
                schema={validationSchema}
                isSpouse
              />
            </TabPanel>

            <TabPanel value={value} index={1}>
              <InformationCategoryFinancialForm
                schema={validationSchema}
                isSpouse
              />
            </TabPanel>
          </StyledCard>
        )}
      </StyledCard>
    </Formik>
  );
};
