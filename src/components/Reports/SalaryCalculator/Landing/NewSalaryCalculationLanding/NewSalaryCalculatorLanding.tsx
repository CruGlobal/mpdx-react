import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Trans, useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { NameDisplay } from 'src/components/Reports/Shared/CalculationReports/NameDisplay/NameDisplay';
import { NoStaffAccount } from 'src/components/Reports/Shared/NoStaffAccount/NoStaffAccount';
import {
  AssignmentCategoryEnum,
  PeopleGroupSupportTypeEnum,
} from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { SalaryInformationCard } from '../../Shared/SalaryInformationCard';
import { useLandingData } from '../useLandingData';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const NewSalaryCalculatorLanding: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const accountListId = useAccountListId();
  const {
    loading,
    staffAccountIds,
    names,
    self,
    spouse,
    isNewStaff,
    salaryData: { currentGrossSalary },
    accountBalance,
    hasInProgressCalculation,
  } = useLandingData();

  const assignmentCategory = self?.staffInfo.assignmentCategory;
  const isFullTime =
    assignmentCategory === AssignmentCategoryEnum.FullTimeRegular ||
    assignmentCategory === AssignmentCategoryEnum.FullTimeTemporary;

  const isSelfSupportedRmo =
    self?.staffInfo.peopleGroupSupportType ===
    PeopleGroupSupportTypeEnum.SupportedRmo;
  const isSpouseSupportedRmo =
    spouse?.staffInfo.peopleGroupSupportType ===
    PeopleGroupSupportTypeEnum.SupportedRmo;
  const isSupportedRmo = isSelfSupportedRmo || isSpouseSupportedRmo;

  if (loading) {
    return <Loading loading />;
  }

  if (!staffAccountIds) {
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
          <Typography variant="body1" paragraph fontWeight="bold">
            <Trans t={t}>
              Your current 403(b) contribution election percentage(s) are shown
              below. If you would like to make changes you may do so by logging
              into{' '}
              <Link
                href="https://accounts.principal.com/app/bookmark/0oadm2qe1orihoKha5d7/login"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.palette.primary.main }}
              >
                your Principal account
              </Link>
              . Please wait to complete your Salary Calculation Form until those
              changes are reflected here on the next business day.
            </Trans>
          </Typography>
          <Typography variant="body1" paragraph fontWeight="bold">
            <Trans t={t}>
              Note: You may be enrolled in our automatic annual 1% increase to
              your 403(b). To verify this or update it, you can go to{' '}
              <Link
                href="https://accounts.principal.com/app/bookmark/0oadm2qe1orihoKha5d7/login"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.palette.primary.main }}
              >
                your Principal account
              </Link>
              . Your gross salary will not be affected, so your net pay will
              decrease by 1%. If you would like to receive the same net pay
              after this 1% increase, you will need to calculate a new salary
              here.
            </Trans>
          </Typography>
        </Box>
        <NameDisplay
          names={names}
          personNumbers={staffAccountIds}
          showContent
          titleOne={t('Current Gross Salary')}
          titleTwo={t('Account Balance')}
          amountOne={currentGrossSalary}
          amountTwo={accountBalance}
        />
        <SalaryInformationCard />
        {isFullTime && isSupportedRmo && !isNewStaff && (
          <Box sx={{ marginTop: theme.spacing(4) }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                router.push(
                  `/accountLists/${accountListId}/reports/salaryCalculator/edit`,
                )
              }
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
