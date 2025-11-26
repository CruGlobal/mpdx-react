import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { SalaryInformationCard } from '../../Shared/SalaryInformationCard';
import { useLandingData } from '../useLandingData';
import { PendingRequestCard } from './PendingRequestCard';
import { StaffNameCard } from './StaffNameCard';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const PendingSalaryCalculationLanding: React.FC = () => {
  const { t } = useTranslation();
  const { self } = useLandingData();
  const firstName = self?.staffInfo.firstName || '';

  return (
    <StyledContainer maxWidth="lg">
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('Salary Calculation Form')}
        </Typography>

        <Typography variant="body1" paragraph>
          {t(
            'We see that {{firstName}} currently has a pending Salary Calculation Form in our system. You may review the status of that form below.',
            { firstName },
          )}
        </Typography>

        <StaffNameCard />
        <PendingRequestCard />
        <SalaryInformationCard />
      </Box>
    </StyledContainer>
  );
};
