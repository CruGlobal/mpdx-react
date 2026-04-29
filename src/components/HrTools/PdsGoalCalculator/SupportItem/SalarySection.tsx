import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { usePdsSummaryData } from '../calculations/usePdsSummaryData';
import {
  buildSalaryBreakdownColumns,
  buildSalaryBreakdownRows,
} from './salaryBreakdown';
import { GridContainer, StyledGrid } from './styledGrid';

export const SalarySection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useDataGridLocaleText();
  const { calculation, hcmUser } = usePdsGoalCalculator();
  const summaryData = usePdsSummaryData(calculation, hcmUser);

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
      <Typography variant="h6" pb={2}>
        {t('Salary')}
      </Typography>
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
