import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
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
