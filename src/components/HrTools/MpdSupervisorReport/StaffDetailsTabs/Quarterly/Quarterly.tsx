import React from 'react';
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
import {
  MpdHealthStatusEnum,
  QuarterlyPayrollHistory,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, monthYearFormat } from 'src/lib/intlFormat';
import { healthLabel } from '../../StaffMemberRow/StaffMember';
import { getQuarterLabel, healthColor } from '../../helpers';

interface StaffTabQuarterlyProps {
  quarterHistory: QuarterlyPayrollHistory;
}

export const StaffTabQuarterly: React.FC<StaffTabQuarterlyProps> = ({
  quarterHistory,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
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
              <Table>
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
                          {monthYearFormat(date.month, date.year, locale)}
                        </TableCell>
                        <TableCell>
                          {currencyFormat(month.payroll, 'USD', locale, {
                            showTrailingZeros: true,
                          })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={healthLabel(t, month.status).toUpperCase()}
                            size="small"
                            sx={(theme) => {
                              const { bg, color } = healthColor(
                                theme,
                                month.status,
                              );
                              return {
                                backgroundColor: bg,
                                color,
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
  const locale = useLocale();
  const { completedQuarters, startingQuarter } = quarterHistory;

  const quarters = startingQuarter
    ? [...completedQuarters, startingQuarter].sort(
        (a, b) => a.fiscalYear - b.fiscalYear || a.quarter - b.quarter,
      )
    : completedQuarters;

  return (
    <Grid container spacing={1}>
      {quarters.map((quarter) => {
        const label = getQuarterLabel(quarter.fiscalYear, quarter.quarter);
        const isStarting = !('averagePayroll' in quarter);
        const payrollLabel = isStarting
          ? t('Partial')
          : currencyFormat(quarter.averagePayroll, 'USD', locale, {
              showTrailingZeros: true,
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
                  </Box>
                  {isStarting && (
                    <Tooltip title={t('Payroll started this quarter')}>
                      <InfoOutlined
                        fontSize="medium"
                        color="inherit"
                        sx={{ ml: 'auto' }}
                      />
                    </Tooltip>
                  )}
                </Box>
              }
              size="small"
              sx={(theme) => {
                const { bg, color } = healthColor(
                  theme,
                  'status' in quarter
                    ? quarter.status
                    : MpdHealthStatusEnum.Gray,
                );
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
