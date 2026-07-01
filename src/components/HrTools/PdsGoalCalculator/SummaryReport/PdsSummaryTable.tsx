import React, { useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  DesignationSupportFormType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import {
  currencyFormat,
  numberFormat,
  percentageFormat,
} from 'src/lib/intlFormat';
import { safeProgressRatio } from '../../Shared/helpers/safeProgressRatio';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
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
    fontWeight: theme.typography.fontWeightBold,
  },
  '.MuiDataGrid-cell.indent': {
    paddingLeft: theme.spacing(4),
  },
  '.MuiDataGrid-cell.amount': {
    fontVariantNumeric: 'tabular-nums',
  },
  '.MuiDataGrid-row.subtotal': {
    fontWeight: theme.typography.fontWeightMedium,
    backgroundColor: theme.palette.action.hover,
  },
  '.MuiDataGrid-row.total-goal': {
    fontWeight: theme.typography.fontWeightBold,
  },
  '.MuiDataGrid-row.progress-start .MuiDataGrid-cell': {
    borderTop: `3px solid ${theme.palette.divider}`,
  },
  '.MuiDataGrid-row.progress-complete .MuiDataGrid-cell.amount': {
    color: theme.palette.success.main,
    fontWeight: theme.typography.fontWeightBold,
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
  const { calculation, summaryData } = usePdsGoalCalculator();

  const valueFormatter = useCallback(
    (value: number, row: PdsSummaryRow) => {
      if (row.percentage) {
        return percentageFormat(value, locale, { fractionDigits: 2 });
      }
      if (row.number) {
        return numberFormat(value, locale);
      }
      return currencyFormat(value, 'USD', locale);
    },
    [locale],
  );

  const { rows, overallTotal } = useMemo((): {
    rows: PdsSummaryRow[];
    overallTotal: number;
  } => {
    if (!calculation || !summaryData) {
      return { rows: [], overallTotal: 0 };
    }

    const { salaryTotals, otherTotals, overallTotal } = summaryData;

    const isFullTime = calculation.status === DesignationSupportStatus.FullTime;
    const isPartTime = calculation.status === DesignationSupportStatus.PartTime;
    const isSimple = calculation.formType === DesignationSupportFormType.Simple;

    const rows: PdsSummaryRow[] = [
      // Salary section
      {
        line: '1A',
        category: t('Gross Monthly Pay'),
        amount: salaryTotals.grossMonthlyPay,
      },
      {
        line: '1B',
        category: t('Employer ½ FICA'),
        amount: salaryTotals.employerFica,
      },
      {
        line: '1',
        category: t('Salary Subtotal'),
        amount: salaryTotals.subtotal,
      },
      // Other expenses section
      ...(isSimple
        ? []
        : [
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
          ]),
      ...(isPartTime
        ? [
            {
              line: isSimple ? '2A' : '2C',
              category: t('Work Comp'),
              amount: otherTotals.workComp,
            },
          ]
        : []),
      ...(isFullTime
        ? [
            {
              line: isSimple ? '2A' : '2C',
              category: t('Benefits'),
              amount: otherTotals.benefits,
            },
          ]
        : []),
      {
        line: '2',
        category: t('Other Subtotal'),
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
        amount: Math.max(overallTotal - supportRaised, 0),
      },
      {
        line: '9',
        category: t('Support Goal Percentage Progress'),
        amount: safeProgressRatio(supportRaised, overallTotal),
        percentage: true,
      },
    ];

    return { rows, overallTotal };
  }, [t, calculation, summaryData, supportRaised]);

  const columns = useMemo(
    (): GridColDef[] => [
      {
        field: 'line',
        headerName: t('Line'),
        width: 80,
        sortable: false,
        hideable: false,
        renderCell: (params) =>
          /^[1-5][A-C]?$/.test(params.row.line) ? params.value : '',
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
        align: 'right',
        headerAlign: 'right',
        valueFormatter,
      },
    ],
    [t, valueFormatter],
  );

  const supportRaisedPercentage = safeProgressRatio(
    supportRaised,
    overallTotal,
  );

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
          const { line, amount } = params.row;
          if (line === '6') {
            return 'total-goal';
          }
          if (line === '1' || line === '2') {
            return 'subtotal';
          }
          if (line === '7') {
            return 'progress-start';
          }
          if (line === '9' && amount >= 1) {
            return 'progress-complete';
          }
          return '';
        }}
        getCellClassName={(params) => {
          if (params.field === 'amount') {
            return 'amount';
          }
          if (params.field === 'category' && /[A-Z]$/.test(params.row.line)) {
            return 'indent';
          }
          return '';
        }}
        rows={rows}
        columns={columns}
        disableColumnFilter
        disableColumnMenu
        disableRowSelectionOnClick
        disableVirtualization
        hideFooter
        autoHeight
        localeText={localeText}
      />
    </>
  );
};
