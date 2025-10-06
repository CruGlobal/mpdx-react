import React, { useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { calculateCategoryEnumTotal } from '../../Shared/calculateTotals';
import { MpdGoalHeaderCards } from './MpdGoalHeaderCards/MpdGoalHeaderCards';

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
  supportRaised: number;
}

export const MpdGoalTable: React.FC<MpdGoalTableProps> = ({
  supportRaised,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const localeText = useDataGridLocaleText();
  const { goalCalculationResult, goalTotals } = useGoalCalculator();

  const supportRemaining = goalTotals.overallTotal - supportRaised;
  const supportRaisedPercentage = supportRaised / goalTotals.overallTotal;

  const valueFormatter = useCallback(
    (value: number, row: MpdGoalRow) =>
      row.percentage
        ? percentageFormat(value, locale)
        : currencyFormat(value, 'USD', locale, { showTrailingZeros: true }),
    [locale],
  );

  const goalCalculation = goalCalculationResult.data?.goalCalculation;
  // TODO: Replace mock reference values with real values
  const rows = useMemo((): MpdGoalRow[] => {
    const family = goalCalculation?.ministryFamily;

    const ministryExpenseRows: MpdGoalRow[] = [
      {
        line: '3A',
        category: t('Ministry Miles'),
        amount: calculateCategoryEnumTotal(
          family,
          PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        ),
        reference: Math.random() * 391 + 10,
      },
      {
        line: '3B',
        category: t('Ministry Travel'),
        amount: calculateCategoryEnumTotal(
          family,
          PrimaryBudgetCategoryEnum.MinistryTravel,
        ),
        reference: Math.random() * 391 + 10,
      },
      {
        line: '3C',
        category: t('Meetings, Retreats, Conferences'),
        amount:
          calculateCategoryEnumTotal(
            family,
            PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences,
          ) +
          calculateCategoryEnumTotal(
            family,
            PrimaryBudgetCategoryEnum.UsStaffConference,
          ),
        reference: Math.random() * 391 + 10,
      },
      {
        line: '3D',
        category: t('Meals and Per Diem'),
        amount: calculateCategoryEnumTotal(
          family,
          PrimaryBudgetCategoryEnum.MealsAndPerDiem,
        ),
        reference: Math.random() * 391 + 10,
      },
      {
        line: '3E',
        category: t('MPD'),
        amount: calculateCategoryEnumTotal(
          family,
          PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
        ),
        reference: Math.random() * 391 + 10,
      },
      {
        line: '3F',
        category: t('Supplies and Materials'),
        amount: calculateCategoryEnumTotal(
          family,
          PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
        ),
        reference: Math.random() * 391 + 10,
      },
      {
        line: '3G',
        category: t('Summer Assignment Expenses'),
        amount:
          calculateCategoryEnumTotal(
            family,
            PrimaryBudgetCategoryEnum.SummerAssignmentExpenses,
          ) +
          calculateCategoryEnumTotal(
            family,
            PrimaryBudgetCategoryEnum.SummerAssignmentTravel,
          ),
        reference: Math.random() * 391 + 10,
      },
      {
        line: '3H',
        category: t('Reimbursable Medical Expenses'),
        amount: calculateCategoryEnumTotal(
          family,
          PrimaryBudgetCategoryEnum.ReimbursableMedicalExpense,
        ),
        reference: Math.random() * 391 + 10,
      },
      {
        line: '3I',
        category: t(
          'Account transfers to staff members, ministries, projects, etc.',
        ),
        amount: calculateCategoryEnumTotal(
          family,
          PrimaryBudgetCategoryEnum.AccountTransfers,
        ),
        reference: Math.random() * 391 + 10,
      },
      {
        line: '3J',
        category: t('Other (includes credit card charges)'),
        amount:
          calculateCategoryEnumTotal(
            family,
            PrimaryBudgetCategoryEnum.InternetServiceProviderFee,
          ) +
          calculateCategoryEnumTotal(
            family,
            PrimaryBudgetCategoryEnum.CellPhoneWorkLine,
          ) +
          calculateCategoryEnumTotal(
            family,
            PrimaryBudgetCategoryEnum.CreditCardProcessingCharges,
          ) +
          calculateCategoryEnumTotal(
            family,
            PrimaryBudgetCategoryEnum.MinistryOther,
          ),
        reference: Math.random() * 391 + 10,
      },
    ];

    return [
      {
        line: '1A',
        category: t('Net Monthly Combined Salary'),
        amount: goalTotals.netMonthlySalary,
        reference: 5511.31,
      },
      {
        line: '1B',
        category: t('Taxes, SECA, VTL, etc. %'),
        amount: goalTotals.taxesPercentage,
        reference: 0.22,
        percentage: true,
      },
      {
        line: '1C',
        category: t('Taxes, SECA, VTL, etc.'),
        amount: goalTotals.taxes,
        reference: 1212.49,
      },
      {
        line: '1D',
        category: t('Subtotal with Net, Taxes, and SECA'),
        amount: goalTotals.salaryPreIra,
        reference: 6723.8,
      },
      {
        line: '1E',
        category: t('Roth 403(b) Contribution %'),
        amount: goalTotals.rothContributionPercentage,
        reference: 0.07,
        percentage: true,
      },
      {
        line: '1F',
        category: t('Traditional 403(b) Contribution %'),
        amount: goalTotals.traditionalContributionPercentage,
        reference: 0,
        percentage: true,
      },
      {
        line: '1G',
        category: t('100% - (Roth + Traditional 403(b)) %'),
        amount:
          1 -
          goalTotals.rothContributionPercentage -
          goalTotals.traditionalContributionPercentage,
        reference: 93,
        percentage: true,
      },
      {
        line: '1H',
        category: t('Roth 403(b)'),
        amount: goalTotals.rothContribution,
        reference: 506.09,
      },
      {
        line: '1I',
        category: t('Traditional 403(b)'),
        amount: goalTotals.traditionalContribution,
        reference: 0,
      },
      {
        line: '1J',
        category: t('Gross Annual Salary'),
        amount: goalTotals.grossAnnualSalary,
        reference: 86758.68,
      },
      {
        line: '1',
        category: t('Gross Monthly Salary'),
        amount: goalTotals.grossMonthlySalary,
        reference: 7229.89,
      },
      {
        line: '2',
        category: t('Benefits'),
        amount: goalTotals.benefitsCharge,
        reference: 2302.24,
      },
      ...ministryExpenseRows,
      {
        line: '4',
        category: t('Ministry Expenses Subtotal'),
        amount: goalTotals.ministryExpensesTotal + goalTotals.benefitsCharge,
        reference: ministryExpenseRows.reduce(
          (sum, row) => sum + row.reference,
          0,
        ),
      },
      {
        line: '5',
        category: t('Subtotal'),
        amount: goalTotals.overallSubtotal,
        reference: 10224.63,
      },
      {
        line: '6',
        category: t('Subtotal with 12% admin charge'),
        amount: goalTotals.overallSubtotalWithAdmin,
        reference: 11618.9,
      },
      {
        line: '7',
        category: t('Total Goal (line 16 x 1.06 attrition)'),
        amount: goalTotals.overallTotal,
        reference: 12316.03,
      },
      {
        line: '8',
        category: t('Solid Monthly Support Developed'),
        amount: supportRaised,
        reference: 0,
      },
      {
        line: '9',
        category: t('Monthly Support to be Developed'),
        amount: supportRemaining,
        reference: 12316.03,
      },
      {
        line: '10',
        category: t('Support Goal Percentage Progress'),
        amount: supportRaisedPercentage,
        reference: 0,
        percentage: true,
      },
    ];
  }, [
    t,
    goalCalculation,
    goalTotals,
    supportRaised,
    supportRemaining,
    supportRaisedPercentage,
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
    <>
      <MpdGoalHeaderCards supportRaisedPercentage={supportRaisedPercentage} />
      <StyledDataGrid
        label={t('MPD Goal')}
        getRowId={(row) => row.line}
        getRowClassName={(params) => {
          const classes: string[] = [];

          // Bold subtotal and total lines
          if (
            params.row.line === '1J' ||
            params.row.line === '7' ||
            params.row.line === '9'
          ) {
            classes.push('bold');
          }

          // Add a top border to some lines
          if (params.row.line === '1' || params.row.line === '7') {
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
    </>
  );
};
