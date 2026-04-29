import React, { useMemo } from 'react';
import { Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { usePdsSummaryData } from '../calculations/usePdsSummaryData';
import {
  buildOtherBreakdownColumns,
  buildOtherBreakdownRows,
} from './otherBreakdown';
import { GridContainer, StyledGrid } from './styledGrid';

export const OtherSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useDataGridLocaleText();
  const { calculation, hcmUser } = usePdsGoalCalculator();
  const summaryData = usePdsSummaryData(calculation, hcmUser);

  const rows = useMemo(() => {
    if (!calculation || !summaryData) {
      return [];
    }

    return buildOtherBreakdownRows(
      calculation,
      summaryData.otherConstants,
      locale,
      t,
    );
  }, [calculation, summaryData, locale, t]);

  const columns = useMemo(
    () => buildOtherBreakdownColumns(locale, t),
    [locale, t],
  );

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <Divider sx={{ mx: -4, my: 4 }} />
      <Typography variant="h6" pb={2}>
        {t('Other')}
      </Typography>
      <GridContainer>
        <StyledGrid
          aria-label={t('Other expenses breakdown')}
          rows={rows}
          columns={columns}
          getRowClassName={(params) => {
            const classes: string[] = [];
            if (params.id === 'subtotal') {
              classes.push('top-border');
              classes.push('bottom-border');
            }
            if (params.row.bold) {
              classes.push('bold-row');
            }
            return classes.join(' ');
          }}
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
