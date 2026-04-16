import React, { useMemo } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import {
  buildSalaryBreakdownColumns,
  buildSalaryBreakdownRows,
} from './salaryBreakdown';

const GridContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

const StyledGrid = styled(DataGrid)(({ theme }) => ({
  fontSize: '1rem',
  '.MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
    color: theme.palette.mpdxBlue.main,
  },
  '.MuiDataGrid-row.top-border .MuiDataGrid-cell': {
    borderTop: `2px solid ${theme.palette.divider}`,
  },
  '.MuiDataGrid-row[data-id="total"]': {
    fontWeight: 'bold',
  },
  '.category-cell': {
    lineHeight: 1.3,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  '.category-formula': {
    display: 'block',
    color: theme.palette.text.secondary,
    fontSize: '0.8125rem',
  },
})) as typeof DataGrid;

export const SalarySection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useDataGridLocaleText();
  const { calculation } = usePdsGoalCalculator();
  const { goalMiscConstants, goalGeographicConstantMap } =
    useGoalCalculatorConstants();

  const employerFicaRate =
    goalMiscConstants.ADDITIONAL_RATES?.EMPLOYER_FICA_RATE?.fee;

  const rows = useMemo(() => {
    if (!calculation || employerFicaRate === undefined) {
      return [];
    }
    const { geographicLocation } = calculation;
    const geographicMultiplier =
      goalGeographicConstantMap.get(geographicLocation ?? '') ?? 0;

    return buildSalaryBreakdownRows(
      calculation,
      { geographicMultiplier, employerFicaRate },
      locale,
      t,
    );
  }, [calculation, employerFicaRate, goalGeographicConstantMap, locale, t]);

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
