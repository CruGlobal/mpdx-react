import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useLandingData } from './useLandingData';

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledValueTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  fontSize: theme.typography.h2.fontSize,
}));

export const SalaryOverviewCard: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { name, staffAccountId, currentGrossSalary, accountBalance } =
    useLandingData();

  return (
    <StyledCard>
      <CardHeader
        title={<Typography variant="h4">{name}</Typography>}
        subheader={
          <Typography variant="h6" color="textSecondary">
            {t(`${staffAccountId}`)}
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Stack spacing={1}>
              <Typography variant="h5" fontWeight="bold">
                {t('Current Gross Salary')}
              </Typography>
              <StyledValueTypography>
                {currencyFormat(currentGrossSalary, 'USD', locale)}
              </StyledValueTypography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={1}>
              <Typography variant="h5" fontWeight="bold">
                {t('Account Balance')}
              </Typography>
              <StyledValueTypography>
                {currencyFormat(accountBalance, 'USD', locale)}
              </StyledValueTypography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};
