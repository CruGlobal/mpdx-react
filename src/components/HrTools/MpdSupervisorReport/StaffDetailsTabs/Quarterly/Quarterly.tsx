import React from 'react';
import { Chip, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import {
  MpdHealthStatusEnum,
  QuarterlyPayrollHistory,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { getQuarterLabel, healthColor } from '../../helpers';

interface StaffTabQuarterlyProps {
  quarterHistory: QuarterlyPayrollHistory;
}

export const StaffTabQuarterly: React.FC<StaffTabQuarterlyProps> = ({
  quarterHistory,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography>
        {t('Average monthly payroll per fiscal quarter - last 8 quarters')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        <QuarterChips quarterHistory={quarterHistory} />
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
        const payrollLabel =
          'averagePayroll' in quarter
            ? currencyFormat(quarter.averagePayroll, 'USD', locale, {
                showTrailingZeros: true,
              })
            : t('Partial');

        return (
          <Grid key={label} size={{ xs: 6, sm: 4, md: 3 }}>
            <Chip
              label={
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
