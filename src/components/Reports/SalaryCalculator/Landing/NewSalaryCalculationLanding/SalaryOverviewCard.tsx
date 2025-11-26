import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLandingData } from '../useLandingData';

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledValueTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  fontSize: theme.typography.h3.fontSize,
}));

export const SalaryOverviewCard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { name, staffAccountId, currentGrossSalary, accountBalance } =
    useLandingData();

  return (
    <StyledCard>
      <CardHeader
        title={<Typography variant="h5">{name}</Typography>}
        subheader={
          <Typography variant="body1" color="textSecondary">
            {t(`${staffAccountId}`)}
          </Typography>
        }
        sx={{ px: theme.spacing(3) }}
      />
      <CardContent>
        <Grid container spacing={theme.spacing(3)}>
          <Grid item xs={6}>
            <Stack spacing={theme.spacing(1)}>
              <Typography variant="h6" fontWeight="bold">
                {t('Current Gross Salary')}
              </Typography>
              <StyledValueTypography>
                {currentGrossSalary}
              </StyledValueTypography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={theme.spacing(1)}>
              <Typography variant="h6" fontWeight="bold">
                {t('Account Balance')}
              </Typography>
              <StyledValueTypography>
                {accountBalance}
              </StyledValueTypography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};
