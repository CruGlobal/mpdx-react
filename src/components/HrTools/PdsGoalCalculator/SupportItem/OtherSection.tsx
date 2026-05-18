import React, { useMemo } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import {
  buildOtherBreakdownColumns,
  buildOtherBreakdownRows,
} from './otherBreakdown';
import { GridContainer, StyledGrid } from './styledGrid';

export const OtherSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useDataGridLocaleText();
  const { calculation, summaryData } = usePdsGoalCalculator();

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
      <Box pb={2}>
        <Typography variant="h6" component="h3">
          {t('Other')}
        </Typography>
        <Typography pt={1}>
          {t(
            'Additional support items beyond your base salary, including benefits, contributions, fees, and reimbursable expenses.',
          )}
        </Typography>
      </Box>
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
