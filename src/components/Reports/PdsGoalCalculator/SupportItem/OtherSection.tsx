import React, { useMemo } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { OtherExpensesConstants } from '../calculations/OtherExpenses';
import { calculateReimbursableTotals } from '../calculations/reimbursableExpenses';
import { calculateSalaryTotals } from '../calculations/salaryCalculation';
import {
  buildOtherBreakdownColumns,
  buildOtherBreakdownRows,
} from './otherBreakdown';

const GridContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

const StyledGrid = styled(DataGrid)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  '.MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
    color: theme.palette.mpdxBlue.main,
  },
  '.MuiDataGrid-row.top-border .MuiDataGrid-cell': {
    borderTop: `2px solid ${theme.palette.divider}`,
  },
  '.MuiDataGrid-row.bold-row': {
    fontWeight: 'bold',
  },
  '.MuiDataGrid-row.bottom-border .MuiDataGrid-cell': {
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  '.category-cell': {
    lineHeight: 1.3,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  '.category-formula': {
    display: 'block',
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
  },
})) as typeof DataGrid;

export const OtherSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useDataGridLocaleText();
  const { calculation, hcmUser } = usePdsGoalCalculator();
  const { goalMiscConstants, goalGeographicConstantMap } =
    useGoalCalculatorConstants();

  const additionalRates = goalMiscConstants.ADDITIONAL_RATES;
  const employerFicaRate = additionalRates?.EMPLOYER_FICA_RATE?.fee;
  const workCompPercentage = additionalRates?.PART_TIME_WORK_COMPENSATION?.fee;
  const attritionRate = additionalRates?.ATTRITION_RATE?.fee;
  const creditCardFeeRate = additionalRates?.CREDIT_CARD_FEE_RATE?.fee;

  const rows = useMemo(() => {
    if (
      !calculation ||
      employerFicaRate === undefined ||
      workCompPercentage === undefined ||
      attritionRate === undefined ||
      creditCardFeeRate === undefined
    ) {
      return [];
    }

    const geographicMultiplier =
      goalGeographicConstantMap.get(calculation.geographicLocation ?? '') ?? 0;

    const salaryTotals = calculateSalaryTotals(calculation, {
      geographicMultiplier,
      employerFicaRate,
    });
    const reimbursableTotals = calculateReimbursableTotals(calculation);

    const taxDeferredPct =
      (hcmUser?.fourOThreeB?.currentTaxDeferredContributionPercentage ?? 0) /
      100;
    const rothPct =
      (hcmUser?.fourOThreeB?.currentRothContributionPercentage ?? 0) / 100;

    const constants: OtherExpensesConstants = {
      reimbursableTotal: reimbursableTotals.total,
      salarySubtotal: salaryTotals.subtotal,
      fourOThreeBPercentage: taxDeferredPct + rothPct,
      grossMonthlyPay: salaryTotals.grossMonthlyPay,
      workCompPercentage,
      attritionRate,
      creditCardFeeRate,
    };

    return buildOtherBreakdownRows(calculation, constants, locale, t);
  }, [
    calculation,
    hcmUser,
    employerFicaRate,
    workCompPercentage,
    attritionRate,
    creditCardFeeRate,
    goalGeographicConstantMap,
    locale,
    t,
  ]);

  const columns = useMemo(
    () => buildOtherBreakdownColumns(locale, t),
    [locale, t],
  );

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
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
