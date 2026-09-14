import React, { useMemo } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  Grid,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { QuarterlyPayrollHistory } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import {
  buildQuarterChips,
  getQuarterLabel,
  healthColor,
  healthLabel,
  quarterAmountLabel,
} from '../../helpers';
import { useQuarterlyPayrollHistoryQuery } from './QuarterlyPayrollHistory.generated';

const emptyHistory: QuarterlyPayrollHistory = {
  monthlyGrossSalary: 0,
  completedQuarters: [],
};

interface StaffTabQuarterlyProps {
  staffAccountId: string | null;
}

export const StaffTabQuarterly: React.FC<StaffTabQuarterlyProps> = ({
  staffAccountId,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { formatCurrency } = useFormatters();

  // The query defaults to the 24-month range, which is the eight quarters this
  // tab shows. No skip: without a staff account the API still returns those
  // quarters, zeroed and gray, so the window renders with N/A amounts rather
  // than nothing.
  const { data, loading, error } = useQuarterlyPayrollHistoryQuery({
    variables: { staffAccountId },
  });
  const quarterHistory = data?.quarterlyPayrollHistory ?? emptyHistory;
  const { startingQuarter } = quarterHistory;

  if (loading) {
    return <DynamicComponentPlaceholder />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <>
      <Typography>
        {t('Average monthly payroll per fiscal quarter · last 8 quarters')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        <QuarterChips
          quarterHistory={quarterHistory}
          hasStaffAccount={!!staffAccountId}
        />
        {startingQuarter && (
          <>
            <Typography sx={{ mt: 4 }}>
              {t(
                'Starting quarter monthly payroll breakdown · {{quarterLabel}}',
                {
                  quarterLabel: getQuarterLabel(
                    startingQuarter.fiscalYear,
                    startingQuarter.quarter,
                  ),
                },
              )}
            </Typography>
            <TableContainer>
              <Table
                size="small"
                aria-label={t(
                  'Starting Quarter Monthly Payroll Breakdown Table',
                )}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Month')}</TableCell>
                    <TableCell>{t('Payroll')}</TableCell>
                    <TableCell>{t('Status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {startingQuarter.months.map((month) => {
                    const date = DateTime.fromISO(month.month ?? '');
                    return (
                      <TableRow key={month.month}>
                        <TableCell>
                          {date.isValid
                            ? monthYearFormat(date.month, date.year, locale)
                            : ''}
                        </TableCell>
                        <TableCell>
                          {quarterAmountLabel({
                            t,
                            hasStaffAccount: !!staffAccountId,
                            status: month.status,
                            averagePayroll: month.payroll,
                            formatCurrency,
                          })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={healthLabel(t, month.status)}
                            size="small"
                            sx={(theme) => {
                              const { bg, color } = healthColor(
                                theme,
                                month.status,
                              );
                              return {
                                backgroundColor: bg,
                                color,
                                textTransform: 'uppercase',
                              };
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </>
  );
};

interface QuarterChipsProps {
  quarterHistory: QuarterlyPayrollHistory;
  hasStaffAccount: boolean;
}

const QuarterChips: React.FC<QuarterChipsProps> = ({
  quarterHistory,
  hasStaffAccount,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  const quarters = useMemo(
    () => buildQuarterChips(quarterHistory),
    [quarterHistory],
  );

  return (
    <Grid container spacing={1}>
      {quarters.map((quarter) => {
        const label = getQuarterLabel(quarter.fiscalYear, quarter.quarter);
        const { averagePayroll, status } = quarter;
        const isStarting = averagePayroll === null;
        const payrollLabel = quarterAmountLabel({
          t,
          hasStaffAccount,
          status,
          averagePayroll,
          formatCurrency,
        });

        return (
          <Grid key={label} size={{ xs: 6, sm: 4, md: 3 }}>
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      pl: 1,
                      lineHeight: 1.2,
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{label}</span>
                    <span style={{ fontSize: '18px', fontWeight: 600 }}>
                      {payrollLabel}
                    </span>
                    <Box component="span" sx={visuallyHidden as SxProps<Theme>}>
                      {healthLabel(t, status)}
                    </Box>
                  </Box>
                  {isStarting && (
                    <Tooltip title={t('Payroll started this quarter')}>
                      <InfoOutlined
                        fontSize="medium"
                        tabIndex={0}
                        titleAccess={t('Payroll started this quarter')}
                        color="inherit"
                        sx={{ ml: 'auto' }}
                      />
                    </Tooltip>
                  )}
                </Box>
              }
              size="small"
              sx={(theme) => {
                const { bg, color } = healthColor(theme, status);
                return {
                  height: 'auto',
                  width: '100%',
                  backgroundColor: bg,
                  color,
                  '& .MuiChip-label': {
                    display: 'block',
                    width: '100%',
                    padding: theme.spacing(1),
                  },
                };
              }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};
