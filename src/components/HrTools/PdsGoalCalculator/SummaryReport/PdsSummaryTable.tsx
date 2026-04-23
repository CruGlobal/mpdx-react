import React, { useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import {
  currencyFormat,
  numberFormat,
  percentageFormat,
} from 'src/lib/intlFormat';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import {
  OtherExpensesConstants,
  calculateOtherExpenses,
} from '../calculations/OtherExpenses';
import { calculateReimbursableTotals } from '../calculations/reimbursableExpenses';
import { calculateSalaryTotals } from '../calculations/salaryCalculation';
import { PdsSummaryHeaderCards } from './PdsSummaryHeaderCards';

interface PdsSummaryRow {
  line: string;
  category: string;
  amount: number;
  percentage?: boolean;
  number?: boolean;
}

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
  },
  '.MuiDataGrid-row.bold': {
    fontWeight: 'bold',
  },
  '.MuiDataGrid-row.top-border': {
    borderTop: '3px solid black',
  },
  '.MuiDataGrid-cell.indent': {
    paddingLeft: theme.spacing(4),
  },
}));

interface PdsSummaryTableProps {
  supportRaised: number;
}

export const PdsSummaryTable: React.FC<PdsSummaryTableProps> = ({
  supportRaised,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useDataGridLocaleText();
  const { calculation, hcmUser } = usePdsGoalCalculator();
  const { goalMiscConstants, goalGeographicConstantMap } =
    useGoalCalculatorConstants();

  const valueFormatter = useCallback(
    (value: number, row: PdsSummaryRow) => {
      if (row.percentage) {
        return percentageFormat(value, locale, { fractionDigits: 2 });
      }
      if (row.number) {
        return numberFormat(value, locale);
      }
      return currencyFormat(value, 'USD', locale, { fractionDigits: 0 });
    },
    [locale],
  );

  const { rows, overallTotal } = useMemo((): {
    rows: PdsSummaryRow[];
    overallTotal: number;
  } => {
    if (!calculation) {
      return { rows: [], overallTotal: 0 };
    }

    const additionalRates = goalMiscConstants.ADDITIONAL_RATES;
    const employerFicaRate = additionalRates?.EMPLOYER_FICA_RATE?.fee;
    const workCompPercentage =
      additionalRates?.PART_TIME_WORK_COMPENSATION?.fee;
    const attritionRate = goalMiscConstants.RATES?.ATTRITION_RATE?.fee;
    const creditCardFeeRate = additionalRates?.CREDIT_CARD_FEE_RATE?.fee;
    const adminRate = goalMiscConstants.RATES?.ADMIN_RATE?.fee;

    if (
      employerFicaRate === undefined ||
      workCompPercentage === undefined ||
      attritionRate === undefined ||
      creditCardFeeRate === undefined ||
      adminRate === undefined
    ) {
      return { rows: [], overallTotal: 0 };
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

    const otherConstants: OtherExpensesConstants = {
      reimbursableTotal: reimbursableTotals.total,
      salarySubtotal: salaryTotals.subtotal,
      fourOThreeBPercentage: taxDeferredPct + rothPct,
      grossMonthlyPay: salaryTotals.grossMonthlyPay,
      workCompPercentage,
      attritionRate,
      creditCardFeeRate,
      adminRate,
    };
    const otherTotals = calculateOtherExpenses(calculation, otherConstants);

    const overallTotal =
      otherTotals.subtotal +
      otherTotals.attrition +
      otherTotals.creditCardFees +
      otherTotals.assessment;

    const isSalaried =
      calculation.salaryOrHourly === DesignationSupportSalaryType.Salaried;
    const isFullTime =
      calculation.status === DesignationSupportStatus.FullTime;
    const isPartTime =
      calculation.status === DesignationSupportStatus.PartTime;

    const rows: PdsSummaryRow[] = [
      // Salary section
      {
        line: '1A',
        category: t('Pay Rate'),
        amount: calculation.payRate ?? 0,
      },
      ...(!isSalaried
        ? [
            {
              line: '1B',
              category: t('Hours per Week'),
              amount: calculation.hoursWorkedPerWeek ?? 0,
              number: true,
            },
          ]
        : []),
      {
        line: isSalaried ? '1B' : '1C',
        category: t('Monthly Base'),
        amount: salaryTotals.monthlyBase,
      },
      {
        line: isSalaried ? '1C' : '1D',
        category: t('Geographic Multiplier'),
        amount: geographicMultiplier,
        percentage: true,
      },
      {
        line: isSalaried ? '1D' : '1E',
        category: t('Gross Monthly Pay'),
        amount: salaryTotals.grossMonthlyPay,
      },
      {
        line: isSalaried ? '1E' : '1F',
        category: t('Employer ½ FICA'),
        amount: salaryTotals.employerFica,
      },
      {
        line: '1',
        category: t('Salary Subtotal'),
        amount: salaryTotals.subtotal,
      },
      // Other expenses section
      {
        line: '2A',
        category: t('Reimbursable Expenses'),
        amount: otherTotals.reimbursableExpenses,
      },
      {
        line: '2B',
        category: t('403b Contributions'),
        amount: otherTotals.fourOThreeBContributions,
      },
      ...(isPartTime
        ? [
            {
              line: '2C',
              category: t('Work Comp'),
              amount: otherTotals.workComp,
            },
          ]
        : []),
      ...(isFullTime
        ? [
            {
              line: '2C',
              category: t('Benefits'),
              amount: otherTotals.benefits,
            },
          ]
        : []),
      {
        line: '2',
        category: t('Subtotal'),
        amount: otherTotals.subtotal,
      },
      // Totals section
      {
        line: '3',
        category: t('Attrition'),
        amount: otherTotals.attrition,
      },
      {
        line: '4',
        category: t('Credit Card Fees'),
        amount: otherTotals.creditCardFees,
      },
      {
        line: '5',
        category: t('Assessment'),
        amount: otherTotals.assessment,
      },
      {
        line: '6',
        category: t('Total Goal'),
        amount: overallTotal,
      },
      // Progress section
      {
        line: '7',
        category: t('Solid Monthly Support Developed'),
        amount: supportRaised,
      },
      {
        line: '8',
        category: t('Monthly Support to be Developed'),
        amount: overallTotal - supportRaised,
      },
      {
        line: '9',
        category: t('Support Goal Percentage Progress'),
        amount: overallTotal > 0 ? supportRaised / overallTotal : 0,
        percentage: true,
      },
    ];

    return { rows, overallTotal };
  }, [
    t,
    calculation,
    hcmUser,
    goalMiscConstants,
    goalGeographicConstantMap,
    supportRaised,
  ]);

  const columns = useMemo(
    (): GridColDef[] => [
      {
        field: 'line',
        headerName: t('Line'),
        width: 80,
        sortable: false,
        hideable: false,
      },
      {
        field: 'category',
        headerName: t('Category'),
        flex: 1,
        minWidth: 200,
        sortable: false,
        hideable: false,
      },
      {
        field: 'amount',
        headerName: t('Amount'),
        width: 120,
        sortable: false,
        hideable: false,
        valueFormatter,
      },
    ],
    [t, valueFormatter],
  );

  const supportRaisedPercentage =
    overallTotal > 0 ? supportRaised / overallTotal : 0;

  return (
    <>
      <PdsSummaryHeaderCards
        overallTotal={overallTotal}
        supportRaisedPercentage={supportRaisedPercentage}
      />
      <StyledDataGrid
        label={t('PDS Goal Summary')}
        getRowId={(row) => row.line}
        getRowClassName={(params) => {
          const classes: string[] = [];
          if (
            params.row.line === '1' ||
            params.row.line === '2' ||
            params.row.line === '6'
          ) {
            classes.push('bold');
            classes.push('top-border');
          }
          return classes.join(' ');
        }}
        getCellClassName={(params) => {
          if (
            params.colDef.field === 'category' &&
            typeof params.row.line === 'string' &&
            /[a-z]/i.test(params.row.line)
          ) {
            return 'indent';
          }
          return '';
        }}
        rows={rows}
        columns={columns}
        disableColumnFilter
        disableRowSelectionOnClick
        disableVirtualization
        hideFooter
        autoHeight
        localeText={localeText}
      />
    </>
  );
};
