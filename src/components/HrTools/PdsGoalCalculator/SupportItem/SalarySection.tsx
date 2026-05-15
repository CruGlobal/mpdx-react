import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import {
  buildSalaryBreakdownColumns,
  buildSalaryBreakdownRows,
} from './salaryBreakdown';
import { GridContainer, StyledGrid } from './styledGrid';

export const SalarySection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useDataGridLocaleText();
  const { calculation, summaryData } = usePdsGoalCalculator();

  const rows = useMemo(() => {
    if (!calculation || !summaryData) {
      return [];
    }

    return buildSalaryBreakdownRows(
      calculation,
      summaryData.salaryConstants,
      locale,
      t,
    );
  }, [calculation, summaryData, locale, t]);

  const columns = useMemo(
    () => buildSalaryBreakdownColumns(locale, t),
    [locale, t],
  );

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <Box pb={2}>
        <Typography variant="h6">{t('Salary')}</Typography>
        <Typography pt={1}>
          {t(
            'Your gross monthly pay broken down by category, calculated from the values entered in Setup.',
          )}
        </Typography>
      </Box>
      <GridContainer>
        <StyledGrid
          aria-label={t('Salary breakdown')}
          rows={rows}
          columns={columns}
          getRowClassName={(params) =>
            params.id === 'gross-monthly-pay' || params.id === 'total'
              ? 'top-border'
              : ''
          }
          disableColumnMenu
          disableColumnSorting
          disableRowSelectionOnClick
          hideFooter
          localeText={localeText}
        />
      </GridContainer>
    </>
  );
};
