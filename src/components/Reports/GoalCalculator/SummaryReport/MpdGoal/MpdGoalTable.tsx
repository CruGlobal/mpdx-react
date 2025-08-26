import React, { useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useGoalLineItems } from './useGoalLineItems';
import type { Goal } from '../useReportExpenses';

interface MpdGoalRow {
  line: string;
  category: string;
  amount: number;
  reference: number;
  percentage?: boolean;
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
  '.MuiDataGrid-columnHeader.reference, .MuiDataGrid-cell.reference': {
    backgroundColor: theme.palette.mpdxBlue.light,
  },
}));

interface MpdGoalTableProps {
  goal: Goal;
}

export const MpdGoalTable: React.FC<MpdGoalTableProps> = ({ goal }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useDataGridLocaleText();
  const calculations = useGoalLineItems(goal);

  const valueFormatter = useCallback(
    (value: number, row: MpdGoalRow) =>
      row.percentage
        ? percentageFormat(value, locale)
        : currencyFormat(value, 'USD', locale, { showTrailingZeros: true }),
    [locale],
  );

  const ministryExpenses = goal.ministryExpenses;
  const rows = useMemo((): MpdGoalRow[] => {
    const ministryExpenseRows: MpdGoalRow[] = [
      ...ministryExpenses.primaryCategories.map((category, index) => {
        const lineNumber = String.fromCharCode(65 + index);
        return {
          line: `3${lineNumber}`,
          category: t(category.label),
          amount: category.amount,
          reference: Math.random() * 391 + 10,
        };
      }),
    ];

    return [
      {
        line: '1A',
        category: t('Net Monthly Combined Salary'),
        amount: goal.netMonthlySalary,
        reference: 5511.31,
      },
      {
        line: '1B',
        category: t('Taxes, SECA, VTL, etc. %'),
        amount: goal.taxesPercentage,
        reference: 0.22,
        percentage: true,
      },
      {
        line: '1C',
        category: t('Taxes, SECA, VTL, etc.'),
        amount: calculations.taxes,
        reference: 1212.49,
      },
      {
        line: '1D',
        category: t('Subtotal with Net, Taxes, and SECA'),
        amount: calculations.salaryPreIra,
        reference: 6723.8,
      },
      {
        line: '1E',
        category: t('Roth 403(b) Contribution %'),
        amount: goal.rothContributionPercentage,
        reference: 0.07,
        percentage: true,
      },
      {
        line: '1F',
        category: t('Traditional 403(b) Contribution %'),
        amount: goal.traditionalContributionPercentage,
        reference: 0,
        percentage: true,
      },
      {
        line: '1G',
        category: t('100% - Roth + Traditional 403(b) %'),
        amount:
          1 -
          goal.rothContributionPercentage -
          goal.traditionalContributionPercentage,
        reference: 93,
        percentage: true,
      },
      {
        line: '1H',
        category: t('Roth 403(b)'),
        amount: calculations.rothContribution,
        reference: 506.09,
      },
      {
        line: '1I',
        category: t('Traditional 403(b)'),
        amount: calculations.traditionalContribution,
        reference: 0,
      },
      {
        line: '1J',
        category: t('Gross Annual Salary'),
        amount: calculations.grossAnnualSalary,
        reference: 86758.68,
      },
      {
        line: '1',
        category: t('Gross Monthly Salary'),
        amount: calculations.grossMonthlySalary,
        reference: 7229.89,
      },
      {
        line: '2',
        category: t('Benefits Charge'),
        amount: ministryExpenses.benefitsCharge,
        reference: 2302.24,
      },
      ...ministryExpenseRows,
      {
        line: '4',
        category: t('Ministry Expenses Subtotal'),
        amount: calculations.ministryExpensesTotal,
        reference: ministryExpenseRows.reduce(
          (sum, row) => sum + row.reference,
          0,
        ),
      },
      {
        line: '5',
        category: t('Subtotal'),
        amount: calculations.overallSubtotal,
        reference: 10224.63,
      },
      {
        line: '6',
        category: t('Subtotal with 12% admin charge'),
        amount: calculations.overallSubtotalWithAdmin,
        reference: 11618.9,
      },
      {
        line: '7',
        category: t('Total Goal (line 16 x 1.06 attrition)'),
        amount: calculations.overallTotal,
        reference: 12316.03,
      },
      {
        line: '8',
        category: t('Solid Monthly Support Developed'),
        amount: calculations.supportRaised,
        reference: 0,
      },
      {
        line: '9',
        category: t('Monthly Support to be Developed'),
        amount: calculations.supportRemaining,
        reference: 12316.03,
      },
      {
        line: '10',
        category: t('Support Goal Percentage Progress'),
        amount: calculations.supportRaisedPercentage,
        reference: 0,
        percentage: true,
      },
    ];
  }, [t, goal, calculations, ministryExpenses]);

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
      {
        field: 'reference',
        headerName: t('NS Reference'),
        headerClassName: 'reference',
        width: 130,
        sortable: false,
        hideable: true,
        valueFormatter,
      },
    ],
    [t, valueFormatter],
  );

  return (
    <StyledDataGrid
      label={t('MPD Goal')}
      getRowId={(row) => row.line}
      getRowClassName={(params) => {
        const classes: string[] = [];

        // Bold subtotal and total lines
        if (
          params.row.category === t('Gross Annual Salary') ||
          params.row.category === t('Total Goal (line 16 x 1.06 attrition)') ||
          params.row.category === t('Monthly Support to be Developed')
        ) {
          classes.push('bold');
        }

        // Add a top border to some lines
        if (
          params.row.line === '1' ||
          params.row.category === t('Total Goal (line 16 x 1.06 attrition)')
        ) {
          classes.push('top-border');
        }

        return classes.join(' ');
      }}
      getCellClassName={(params) => {
        const classes: string[] = [];

        // Indent categories belonging to lines that contain a letter
        if (
          params.colDef.field === 'category' &&
          typeof params.row.line === 'string' &&
          /[a-z]/i.test(params.row.line)
        ) {
          classes.push('indent');
        }

        // Identify reference cells
        if (params.colDef.field === 'reference') {
          classes.push(params.colDef.field);
        }

        return classes.join(' ');
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
  );
};
