import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useStaffAccountQuery } from '../../StaffAccount.generated';
import { useHcmQuery } from '../SalaryCalculatorContext/Hcm.generated';
import { useAccountBalanceQuery } from './AccountBalance.generated';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface NewSalaryCalculatorLandingProps {
  onStartCalculation: () => void;
  hasExistingCalculation: boolean;
}

export const NewSalaryCalculatorLanding: React.FC<
  NewSalaryCalculatorLandingProps
> = ({ onStartCalculation, hasExistingCalculation }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: staffAccountData, loading: staffLoading } =
    useStaffAccountQuery();
  const { data: hcmData, loading: hcmLoading } = useHcmQuery();
  const { data: accountBalanceData, loading: accountBalanceLoading } =
    useAccountBalanceQuery();

  if (staffLoading || hcmLoading || accountBalanceLoading) {
    return <Loading loading />;
  }

  const { id } = staffAccountData?.staffAccount ?? {};
  const [self, spouse] = hcmData?.hcm ?? [];
  const hasSpouse = hcmData?.hcm?.length === 2;

  const name =
    self?.staffInfo.firstName && self?.staffInfo.lastName
      ? `${self.staffInfo.lastName}, ${self.staffInfo.firstName}`
      : '';

  const currentGrossSalary = self?.currentSalary.grossSalaryAmount ?? 0;
  const spouseCurrentGrossSalary = spouse?.currentSalary.grossSalaryAmount ?? 0;

  const accountBalance =
    accountBalanceData?.reportsStaffExpenses?.funds?.reduce(
      (sum, fund) => sum + (fund.total ?? 0),
      0,
    ) ?? 0;

  const salaryCategories = [
    {
      category: t('Gross Salary'),
      user: currentGrossSalary,
      spouse: spouseCurrentGrossSalary,
    },
    { category: t('Taxes'), user: 0, spouse: 0 },
    {
      category: t('Security (SECA/FICA) Status'),
      user: self?.staffInfo.secaStatus,
      spouse: spouse?.staffInfo.secaStatus,
    },
    { category: t('403(b)'), user: 0, spouse: 0 },
  ];

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

        <StyledCard>
          <CardHeader title={name} subheader={t('({{id}})', { id })} />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Box />
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" fontWeight="bold" align="right">
                  {t('Current Gross Salary')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" fontWeight="bold" align="right">
                  {t('Account Balance')}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body1" align="right">
                  {currencyFormat(currentGrossSalary, 'USD', locale)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body1" align="right">
                  {currencyFormat(accountBalance, 'USD', locale)}
                </Typography>
              </Grid>

              {hasSpouse && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body1" align="right">
                      {currencyFormat(spouseCurrentGrossSalary, 'USD', locale)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1" align="right">
                      {currencyFormat(accountBalance, 'USD', locale)}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </StyledCard>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('Category')}</TableCell>
                <TableCell align="right">{self?.staffInfo.firstName}</TableCell>
                {hasSpouse && (
                  <TableCell align="right">
                    {spouse?.staffInfo.firstName}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {salaryCategories.map((row) => (
                <TableRow key={row.category}>
                  <TableCell component="th" scope="row">
                    {row.category}
                  </TableCell>
                  <TableCell align="right">{row.user ?? ''}</TableCell>
                  {hasSpouse && (
                    <TableCell align="right">{row.spouse ?? ''}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
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
