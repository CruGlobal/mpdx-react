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
  useTheme,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { getStatusColors } from '../Shared/Helper/getStatusColors';
import { useSalaryCalculations } from '../Shared/useSalaryCalculations';

const StyledCard = styled(Card)(() => ({
  overflow: 'visible',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
}));

const StyledHeaderLeft = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledProgressSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledFlexRow = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const StyledTotalRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxGrayLight.main,
  '& td': {
    borderBottom: 'none',
  },
}));

export const TotalAnnualSalarySummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();
  const { requestData, user } = useAdditionalSalaryRequest();
  const [expanded, setExpanded] = useState(true);
  const { values } = useFormikContext<CompleteFormValues>();

  const asrValues = requestData?.latestAdditionalSalaryRequest;
  const calculations = asrValues?.calculations;

  const traditional403bContribution =
    asrValues?.traditional403bContribution ?? 0;

  const grossAnnualSalary = user?.currentSalary?.grossSalaryAmount ?? 0;

  const {
    total,
    totalAnnualSalary,
    remainingInMaxAllowable,
    maxAllowableSalary,
    additionalSalaryReceivedThisYear,
  } = useSalaryCalculations({
    traditional403bContribution,
    values,
    calculations,
    grossSalaryAmount: grossAnnualSalary,
  });

  const progressPercentage =
    maxAllowableSalary > 0
      ? Math.min((totalAnnualSalary / maxAllowableSalary) * 100, 100)
      : 0;
  const isOverMax =
    maxAllowableSalary > 0 && totalAnnualSalary > maxAllowableSalary;
  const colors = useMemo(
    () => getStatusColors(theme, isOverMax, remainingInMaxAllowable),
    [theme, isOverMax, remainingInMaxAllowable],
  );

  const summaryItems = useMemo(
    () => [
      {
        id: 'maxAllowable',
        label: t('Maximum Allowable Salary'),
        value: maxAllowableSalary,
      },
      {
        id: 'grossAnnual',
        label: t('Gross Annual Salary'),
        value: grossAnnualSalary,
      },
      {
        id: 'additionalReceived',
        label: t('Additional Salary Received This Year'),
        description: t('Does not include payments received for backpay.'),
        value: additionalSalaryReceivedThisYear,
      },
      {
        id: 'additionalRequested',
        label: t('Additional Salary on This Request'),
        description: t('Does not include requests made for backpay.'),
        value: total,
      },
    ],
    [
      t,
      maxAllowableSalary,
      grossAnnualSalary,
      additionalSalaryReceivedThisYear,
      total,
    ],
  );

  return (
    <StyledCard>
      <StyledHeader
        sx={{
          backgroundColor: colors.headerBackground,
        }}
      >
        <StyledHeaderLeft>
          {isOverMax && <WarningAmberIcon sx={{ color: colors.primary }} />}

          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: colors.primary }}
          >
            {t('Total Annual Salary')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            {t('A review of your income')}
          </Typography>
        </StyledHeaderLeft>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          aria-label={
            expanded ? t('Collapse salary details') : t('Expand salary details')
          }
          aria-expanded={expanded}
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
          <StyledFlexRow sx={{ mb: 1 }}>
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
              {currencyFormat(totalAnnualSalary, 'USD', locale)}/
              {currencyFormat(maxAllowableSalary, 'USD', locale)}
            </Typography>
          </StyledFlexRow>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.mpdxGray.main,
              '& .MuiLinearProgress-bar': {
                backgroundColor: colors.primary,
                borderRadius: 4,
              },
            }}
          />
          <StyledFlexRow sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('Remaining in your Max Allowable Salary')}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.remaining }}>
              {currencyFormat(remainingInMaxAllowable, 'USD', locale)}
            </Typography>
          </StyledFlexRow>
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
              {summaryItems.map(({ id, label, description, value }) => (
                <TableRow key={id}>
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
                    sx={{ color: colors.total }}
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
