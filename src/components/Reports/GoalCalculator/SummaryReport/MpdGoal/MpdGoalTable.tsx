import React, { useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import {
  calculateNewStaffGoalTotals,
  getNewStaffBudgetCategory,
} from '../../Shared/calculateNewStaffTotals';
import {
  GoalTotals,
  calculateCategoryEnumTotal,
} from '../../Shared/calculateTotals';
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
  const constants = useGoalCalculatorConstants();
  const { goalMiscConstants } = constants;

  const valueFormatter = useCallback(
    (value: number, row: MpdGoalRow) =>
      row.percentage
        ? percentageFormat(value, locale, { fractionDigits: 2 })
        : currencyFormat(value, 'USD', locale, { fractionDigits: 0 }),
    [locale],
  );

  const newStaffReference = useMemo(
    () =>
      calculateNewStaffGoalTotals(
        goalCalculationResult.data?.goalCalculation ?? null,
        constants,
      ),
    [goalCalculationResult, constants],
  );

  const goalCalculation = goalCalculationResult.data?.goalCalculation;
  const rows = useMemo((): MpdGoalRow[] => {
    const ministryExpenseCategories = [
      {
        line: '3A',
        category: t('Ministry Miles'),
        categories: [PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage],
      },
      {
        line: '3B',
        category: t('Ministry Travel'),
        categories: [PrimaryBudgetCategoryEnum.MinistryTravel],
      },
      {
        line: '3C',
        category: t('Meetings, Retreats, Conferences'),
        categories: [
          PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences,
          PrimaryBudgetCategoryEnum.UsStaffConference,
        ],
      },
      {
        line: '3D',
        category: t('Meals and Per Diem'),
        categories: [PrimaryBudgetCategoryEnum.MealsAndPerDiem],
      },
      {
        line: '3E',
        category: t('MPD'),
        categories: [PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment],
      },
      {
        line: '3F',
        category: t('Supplies and Materials'),
        categories: [PrimaryBudgetCategoryEnum.SuppliesAndMaterials],
      },
      {
        line: '3G',
        category: t('Summer Assignment Expenses'),
        categories: [PrimaryBudgetCategoryEnum.SummerAssignmentExpenses],
      },
      {
        line: '3H',
        category: t('Reimbursable Medical Expenses'),
        categories: [PrimaryBudgetCategoryEnum.ReimbursableMedicalExpenses],
      },
      {
        line: '3I',
        category: t(
          'Account transfers to staff members, ministries, projects, etc.',
        ),
        categories: [PrimaryBudgetCategoryEnum.AccountTransfers],
      },
      {
        line: '3J',
        category: t('Other (includes credit card charges)'),
        categories: [
          PrimaryBudgetCategoryEnum.InternetServiceProviderFee,
          PrimaryBudgetCategoryEnum.CellPhoneWorkLine,
          PrimaryBudgetCategoryEnum.CreditCardProcessingCharges,
          PrimaryBudgetCategoryEnum.MinistryOther,
        ],
      },
    ];
    const ministryExpenseRows = ministryExpenseCategories.map(
      ({ categories, ...rowFields }): MpdGoalRow => ({
        ...rowFields,
        amount: categories.reduce(
          (sum, category) =>
            sum +
            calculateCategoryEnumTotal(
              goalCalculation?.ministryFamily,
              category,
            ),
          0,
        ),
        reference: categories.reduce(
          (sum, category) =>
            sum +
            getNewStaffBudgetCategory(
              goalCalculation,
              category,
              goalMiscConstants,
            ),
          0,
        ),
      }),
    );

    // The rows can have an amount and reference value, or a value function that calculates the
    // amount and reference value from the goal total and new staff goal total
    const rows: Array<
      | MpdGoalRow
      | (Omit<MpdGoalRow, 'amount' | 'reference'> & {
          value: (goalTotals: GoalTotals) => number;
        })
    > = [
      {
        line: '1A',
        category: t('Net Monthly Combined Salary'),
        value: (goalTotals) => goalTotals.netMonthlySalary,
      },
      {
        line: '1B',
        category: t('Taxes, SECA, VTL, etc. %'),
        value: (goalTotals) => goalTotals.taxesPercentage,
        percentage: true,
      },
      {
        line: '1C',
        category: t('Taxes, SECA, VTL, etc.'),
        value: (goalTotals) => goalTotals.taxes,
      },
      {
        line: '1D',
        category: t('Subtotal with Net, Taxes, and SECA'),
        value: (goalTotals) => goalTotals.salaryPreIra,
      },
      {
        line: '1E',
        category: t('Roth 403(b) Contribution %'),
        value: (goalTotals) => goalTotals.rothContributionPercentage,
        percentage: true,
      },
      {
        line: '1F',
        category: t('Traditional 403(b) Contribution %'),
        value: (goalTotals) => goalTotals.traditionalContributionPercentage,
        percentage: true,
      },
      {
        line: '1G',
        category: t('100% - (Roth + Traditional 403(b)) %'),
        value: (goalTotals) =>
          1 -
          goalTotals.rothContributionPercentage -
          goalTotals.traditionalContributionPercentage,
        percentage: true,
      },
      {
        line: '1H',
        category: t('Roth 403(b)'),
        value: (goalTotals) => goalTotals.rothContribution,
      },
      {
        line: '1I',
        category: t('Traditional 403(b)'),
        value: (goalTotals) => goalTotals.traditionalContribution,
      },
      {
        line: '1J',
        category: t('Gross Annual Salary'),
        value: (goalTotals) => goalTotals.grossAnnualSalary,
      },
      {
        line: '1',
        category: t('Gross Monthly Salary'),
        value: (goalTotals) => goalTotals.grossMonthlySalary,
      },
      {
        line: '2',
        category: t('Benefits'),
        value: (goalTotals) => goalTotals.benefitsCharge,
      },
      ...ministryExpenseRows,
      {
        line: '4',
        category: t('Ministry Expenses Subtotal'),
        value: (goalTotals) =>
          goalTotals.ministryExpensesTotal + goalTotals.benefitsCharge,
      },
      {
        line: '5',
        category: t('Subtotal'),
        value: (goalTotals) => goalTotals.overallSubtotal,
      },
      {
        line: '6',
        category: t('Subtotal with {{admin}} admin charge', {
          admin: percentageFormat(
            goalMiscConstants.RATES?.ADMIN_RATE?.fee ?? 0,
            locale,
          ),
        }),
        value: (goalTotals) => goalTotals.overallSubtotalWithAdmin,
      },
      {
        line: '7',
        category: t('Total Goal (line 6 with {{attrition}} attrition)', {
          attrition: percentageFormat(
            goalMiscConstants.RATES?.ATTRITION_RATE?.fee ?? 0,
            locale,
          ),
        }),
        value: (goalTotals) => goalTotals.overallTotal,
      },
      {
        line: '8',
        category: t('Solid Monthly Support Developed'),
        value: () => supportRaised,
      },
      {
        line: '9',
        category: t('Monthly Support to be Developed'),
        value: (goalTotals) => goalTotals.overallTotal - supportRaised,
      },
      {
        line: '10',
        category: t('Support Goal Percentage Progress'),
        value: (goalTotals) => supportRaised / goalTotals.overallTotal,
        percentage: true,
      },
    ];

    return rows.map((row) => {
      if ('value' in row) {
        return {
          ...row,
          amount: row.value(goalTotals),
          reference: row.value(newStaffReference),
        };
      }

      return row;
    });
  }, [
    t,
    goalCalculation,
    goalTotals,
    goalMiscConstants,
    newStaffReference,
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
        field: 'reference',
        headerName: t('NS Reference'),
        headerClassName: 'reference',
        width: 130,
        sortable: false,
        hideable: true,
        valueFormatter,
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

  return (
    <>
      <MpdGoalHeaderCards
        supportRaisedPercentage={supportRaised / goalTotals.overallTotal}
      />
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
