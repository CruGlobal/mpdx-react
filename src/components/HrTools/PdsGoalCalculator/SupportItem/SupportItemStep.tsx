import React, { useMemo } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading';
import { useLocale } from 'src/hooks/useLocale';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { GridContainer, StyledGrid } from './styledGrid';
import {
  buildSupportItemBreakdownColumns,
  buildSupportItemBreakdownRows,
} from './supportItemBreakdown';

export const SupportItemStep: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { calculation, summaryData, calculationLoading } =
    usePdsGoalCalculator();

  const rows = useMemo(() => {
    if (!calculation || !summaryData) {
      return [];
    }

    return buildSupportItemBreakdownRows(
      calculation,
      summaryData.salaryConstants,
      summaryData.otherConstants,
      t,
    );
  }, [calculation, summaryData, t]);

  const columns = useMemo(
    () => buildSupportItemBreakdownColumns(locale, t),
    [locale, t],
  );

  if (calculationLoading) {
    return <Loading loading />;
  }

  return (
    <>
      <Box pb={4}>
        <Typography variant="h6" component="h2">
          {t('Support Items')}
        </Typography>
        <Typography pt={1}>
          {t(
            'A breakdown of the items that make up your support goal, calculated from the information you entered in Setup and Reimbursable Expenses.',
          )}
        </Typography>
      </Box>
      <Divider sx={{ mx: -4, my: 4 }} />
      {rows.length > 0 && (
        <>
          <GridContainer>
            <StyledGrid
              aria-label={t('Support items breakdown')}
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
            />
          </GridContainer>
          <Divider sx={{ mx: -4, my: 4 }} />
        </>
      )}
    </>
  );
};
