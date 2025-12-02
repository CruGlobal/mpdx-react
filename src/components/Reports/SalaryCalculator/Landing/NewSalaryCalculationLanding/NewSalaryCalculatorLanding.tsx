import Link from 'next/link';
import React from 'react';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { NameDisplay } from 'src/components/Reports/Shared/CalculationReports/NameDisplay/NameDisplay';
import { NoStaffAccount } from 'src/components/Reports/Shared/NoStaffAccount/NoStaffAccount';
import {
  AssignmentCategoryEnum,
  SalaryRequestStatusEnum,
} from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { SalaryInformationCard } from '../../Shared/SalaryInformationCard';
import { useLandingData } from '../useLandingData';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const NewSalaryCalculatorLanding: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    loading,
    staffAccountId,
    name,
    self,
    isNewStaff,
    salaryData: { currentGrossSalary },
    accountBalance,
  } = useLandingData();

  const { startCalculation, calculation } = useSalaryCalculator();
  const hasInProgressCalculation =
    calculation?.status === SalaryRequestStatusEnum.InProgress;

  const assignmentCategory = self?.staffInfo.assignmentCategory;
  const isFullTime =
    assignmentCategory === AssignmentCategoryEnum.FullTimeRegular ||
    assignmentCategory === AssignmentCategoryEnum.FullTimeTemporary;

  if (loading) {
    return <Loading loading />;
  }

  if (!staffAccountId) {
    return <NoStaffAccount />;
  }

  return (
    <StyledContainer>
      <Box>
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('Salary Calculation Form')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t(
              'Using this form will enable you to make adjustments to your salary. Your current salary information is displayed below. To begin a new salary calculation, click on "Calculate New Salary." Your Maximum Allowable Salary includes your salary, taxes, SECA, and 403(b).',
            )}
          </Typography>
          <Typography variant="body1" paragraph>
            {t(
              'Your 403(b) contribution election percentage(s) are shown below. If you would like to make changes you may do so by logging into',
            )}{' '}
            <Link
              href="https://accounts.principal.com/app/bookmark/0oadm2qe1orihoKba5d7/login"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.palette.primary.main }}
            >
              {t('your Principal account')}
            </Link>
            .{' '}
            {t(
              'Please wait to complete your Salary Calculation Form until those changes are reflected here.',
            )}
          </Typography>
        </Box>
        <NameDisplay
          names={name}
          personNumbers={staffAccountId ?? ''}
          showContent
          titleOne={t('Current Gross Salary')}
          titleTwo={t('Account Balance')}
          amountOne={currentGrossSalary}
          amountTwo={accountBalance}
        />
        <SalaryInformationCard />
        {isFullTime && !isNewStaff && (
          <Box sx={{ marginTop: theme.spacing(4) }}>
            <Button
              variant="contained"
              color="primary"
              onClick={startCalculation}
            >
              {hasInProgressCalculation
                ? t('Continue Salary Calculation')
                : t('Calculate New Salary')}
            </Button>
          </Box>
        )}
      </Box>
    </StyledContainer>
  );
};
