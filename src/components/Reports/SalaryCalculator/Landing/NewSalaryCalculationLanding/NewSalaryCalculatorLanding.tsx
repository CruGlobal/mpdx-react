import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { NoStaffAccount } from 'src/components/Reports/Shared/NoStaffAccount/NoStaffAccount';
import theme from 'src/theme';
// import { PartTimeInfo } from './PartTimeInfo';
import { SalaryInformationCard } from '../../Shared/SalaryInformationCard';
import { useLandingData } from '../useLandingData';
import { SalaryOverviewCard } from './SalaryOverviewCard';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

interface NewSalaryCalculatorLandingProps {
  onStartCalculation: () => void;
  hasExistingCalculation: boolean;
}

export const NewSalaryCalculatorLanding: React.FC<
  NewSalaryCalculatorLandingProps
> = ({ onStartCalculation, hasExistingCalculation }) => {
  const { t } = useTranslation();
  // const { supportStatus, loading, staffAccountId } = useLandingData();
  const { loading, staffAccountId } = useLandingData();
  if (loading) {
    return <Loading loading />;
  }

  if (!staffAccountId) {
    return <NoStaffAccount />;
  }

  // if (supportStatus && supportStatus === 'full_time') {
  //   return <PartTimeInfo />;
  // }

  return (
    <StyledContainer maxWidth="lg">
      <Box>
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
            'Your 403(b) contribution election percentage(s) are shown below. If you would like to make changes you may do so by logging into your Principal account. Please wait to complete your Salary Calculation Form until those changes are reflected here.',
          )}
        </Typography>
        <SalaryOverviewCard />
        <SalaryInformationCard />
        <Box sx={{ marginTop: theme.spacing(4) }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onStartCalculation}
          >
            {hasExistingCalculation
              ? t('Continue Salary Calculation')
              : t('Calculate New Salary')}
          </Button>
        </Box>
      </Box>
    </StyledContainer>
  );
};
