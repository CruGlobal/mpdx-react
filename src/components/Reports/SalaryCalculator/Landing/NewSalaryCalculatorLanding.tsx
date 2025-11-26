import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { SalaryInformationCard } from './SalaryInformationCard';
import { SalaryOverviewCard } from './SalaryOverviewCard';
import { useLandingData } from './useLandingData';

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
  const { loading } = useLandingData();

  if (loading) {
    return <Loading loading />;
  }

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

        <Box sx={(theme) => ({ mt: theme.spacing(4) })}>
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
