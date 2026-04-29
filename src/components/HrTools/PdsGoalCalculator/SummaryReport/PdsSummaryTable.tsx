import React, { useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import {
  currencyFormat,
  numberFormat,
  percentageFormat,
} from 'src/lib/intlFormat';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { usePdsSummaryData } from '../calculations/usePdsSummaryData';
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
  const summaryData = usePdsSummaryData(calculation, hcmUser);

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

    const { salaryTotals, otherTotals, overallTotal, geographicMultiplier } =
      summaryData;

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
        amount:
          overallTotal > 0 ? Math.min(supportRaised / overallTotal, 1) : 0,
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
    overallTotal > 0 ? Math.min(supportRaised / overallTotal, 1) : 0;

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
