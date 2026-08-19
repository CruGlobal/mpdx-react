import React, { useMemo } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import {
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import {
  MpdHealthStatusEnum,
  QuarterlyPayrollHistory,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import {
  buildQuarterChips,
  getQuarterLabel,
  healthColor,
  healthLabel,
} from '../../helpers';

interface StaffTabQuarterlyProps {
  quarterHistory: QuarterlyPayrollHistory;
}

export const StaffTabQuarterly: React.FC<StaffTabQuarterlyProps> = ({
  quarterHistory,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { formatCurrency } = useFormatters();
  const { startingQuarter } = quarterHistory;

  return (
    <>
      <Typography>
        {t('Average monthly payroll per fiscal quarter · last 8 quarters')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        <QuarterChips quarterHistory={quarterHistory} />
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
                        <TableCell>{formatCurrency(month.payroll)}</TableCell>
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
}

const QuarterChips: React.FC<QuarterChipsProps> = ({ quarterHistory }) => {
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
        const payrollLabel = isStarting
          ? t('Partial')
          : status === MpdHealthStatusEnum.Gray
            ? '-'
            : formatCurrency(averagePayroll);

        return (
          <Grid key={label} size={{ xs: 6, sm: 4, md: 3 }}>
            <Chip
              aria-label={t('{{label}}: {{amount}} ({{status}})', {
                label,
                amount: payrollLabel,
                status: healthLabel(t, status),
              })}
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
