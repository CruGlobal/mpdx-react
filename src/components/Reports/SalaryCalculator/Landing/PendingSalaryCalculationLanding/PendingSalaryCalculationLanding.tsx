import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { NameDisplay } from 'src/components/Reports/Shared/CalculationReports/NameDisplay/NameDisplay';
import { NoStaffAccount } from 'src/components/Reports/Shared/NoStaffAccount/NoStaffAccount';
import { SalaryInformationCard } from '../../Shared/SalaryInformationCard';
import { useLandingData } from '../useLandingData';
import { PendingRequestCard } from './PendingRequestCard';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const PendingSalaryCalculationLanding: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { loading, staffAccountId, names } = useLandingData();

  if (loading) {
    return <Loading loading />;
  }

  if (!staffAccountId) {
    return <NoStaffAccount />;
  }

  // TODO: Update text with correct HR contact info when available.
  return (
    <StyledContainer>
      <Box>
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('Your Salary Calculation Form')}
          </Typography>
          <Typography>
            {t(
              `We see that {{ names }} currently has a pending Salary Calculation Form  in our system. You may review the status of that form below. 
              If you have any questions regarding a pending request please contact [HR Services] at [Phone] or [Email].`,
              { names },
            )}
          </Typography>
        </Box>

        <NameDisplay names={names} personNumbers={staffAccountId} />

        <PendingRequestCard />

        <SalaryInformationCard />
      </Box>
    </StyledContainer>
  );
};
