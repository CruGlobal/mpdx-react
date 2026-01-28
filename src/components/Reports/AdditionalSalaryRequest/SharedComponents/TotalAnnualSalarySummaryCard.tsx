import React, { useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { useSalaryCalculations } from '../Shared/useSalaryCalculations';

const StyledCard = styled(Card)(() => ({
  overflow: 'visible',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  backgroundColor: '#FFF8E1',
  borderBottom: '1px solid #FFE0B2',
}));

const StyledHeaderLeft = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}));

const StyledProgressSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledProgressHeader = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
}));

const StyledRemainingRow = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 8,
}));

const StyledTotalRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  '& td': {
    borderBottom: 'none',
  },
}));

export const TotalAnnualSalarySummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { requestData } = useAdditionalSalaryRequest();
  const [expanded, setExpanded] = useState(true);

  const values = requestData?.additionalSalaryRequest;
  const calculations = values?.calculations;

  const traditional403bContribution = values?.traditional403bContribution ?? 0;

  const { total } = useSalaryCalculations({
    traditional403bContribution,
    values,
  });

  const maxAllowableSalary = calculations?.maxAmountAndReason?.amount ?? 0;
  const grossAnnualSalary = calculations?.predictedYearIncome ?? 0;
  const additionalSalaryReceivedThisYear = calculations?.pendingAsrAmount ?? 0;
  const additionalSalaryOnThisRequest = total;

  const totalAnnualSalary =
    grossAnnualSalary +
    additionalSalaryReceivedThisYear +
    additionalSalaryOnThisRequest;

  const totalSalaryRequested = totalAnnualSalary;
  const remainingInMaxAllowable = maxAllowableSalary - totalSalaryRequested;
  const progressPercentage =
    maxAllowableSalary > 0
      ? Math.min((totalSalaryRequested / maxAllowableSalary) * 100, 100)
      : 0;
  const isOverMax = totalSalaryRequested > maxAllowableSalary;

  const summaryItems = useMemo(
    () => [
      {
        label: t('Maximum Allowable Salary'),
        value: maxAllowableSalary,
      },
      {
        label: t('Gross Annual Salary'),
        value: grossAnnualSalary,
      },
      {
        label: t('Additional Salary Received This Year'),
        description: t('Does not include payments received for backpay.'),
        value: additionalSalaryReceivedThisYear,
      },
      {
        label: t('Additional Salary on This Request'),
        description: t('Does not include requests made for backpay.'),
        value: additionalSalaryOnThisRequest,
      },
    ],
    [
      t,
      maxAllowableSalary,
      grossAnnualSalary,
      additionalSalaryReceivedThisYear,
      additionalSalaryOnThisRequest,
    ],
  );

  return (
    <StyledCard>
      <StyledHeader>
        <StyledHeaderLeft>
          <WarningAmberIcon sx={{ color: theme.palette.warning.main }} />
          <Typography variant="subtitle1" fontWeight="bold">
            {t('Total Annual Salary')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            {t('A review of your income')}
          </Typography>
        </StyledHeaderLeft>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </StyledHeader>
      <Collapse in={expanded}>
        <StyledProgressSection>
          <StyledProgressHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                {t('Total Salary Requested')}
              </Typography>
              <Tooltip
                title={t(
                  'This shows how much of your maximum allowable salary you are using.',
                )}
              >
                <InfoOutlinedIcon
                  sx={{ fontSize: 18, color: 'text.secondary' }}
                />
              </Tooltip>
            </Box>
            <Typography variant="body1" fontWeight="bold">
              {currencyFormat(totalSalaryRequested, 'USD', locale)}/
              {currencyFormat(maxAllowableSalary, 'USD', locale)}
            </Typography>
          </StyledProgressHeader>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: isOverMax
                  ? theme.palette.error.main
                  : theme.palette.warning.main,
                borderRadius: 4,
              },
            }}
          />
          <StyledRemainingRow>
            <Typography variant="body2" color="text.secondary">
              {t('Remaining in your Max Allowable Salary')}
            </Typography>
            <Typography
              variant="body2"
              color={remainingInMaxAllowable < 0 ? 'error' : 'text.secondary'}
            >
              {currencyFormat(remainingInMaxAllowable, 'USD', locale)}
            </Typography>
          </StyledRemainingRow>
        </StyledProgressSection>

        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '70%' }}>
                  {t('Description')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                  {t('Amount')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryItems.map(({ label, description, value }) => (
                <TableRow key={label}>
                  <TableCell>
                    <Typography variant="body1">{label}</Typography>
                    {description && (
                      <Typography variant="body2" color="text.secondary">
                        {description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{currencyFormat(value, 'USD', locale)}</TableCell>
                </TableRow>
              ))}
              <StyledTotalRow>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {t('Total Annual Salary:')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={isOverMax ? 'error' : 'warning.main'}
                  >
                    {currencyFormat(totalAnnualSalary, 'USD', locale)}
                  </Typography>
                </TableCell>
              </StyledTotalRow>
            </TableBody>
          </Table>
        </CardContent>
      </Collapse>
    </StyledCard>
  );
};
