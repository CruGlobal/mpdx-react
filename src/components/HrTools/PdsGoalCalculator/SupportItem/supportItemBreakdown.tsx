import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Tooltip, styled } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { TFunction } from 'i18next';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { currencyFormat, numberFormat } from 'src/lib/intlFormat';
import {
  OtherExpensesConstants,
  OtherExpensesFields,
  OtherExpensesTotals,
  calculateOtherExpenses,
} from '../calculations/OtherExpenses';
import {
  SalaryCalculationFields,
  SalaryConstants,
  calculateSalaryTotals,
} from '../calculations/salaryCalculation';

type AmountFormat = 'currency' | 'number';

const CategoryCellBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  height: '100%',
});

export type SupportItemCalculationFields = SalaryCalculationFields &
  OtherExpensesFields;

export interface SupportItemBreakdownRow {
  id: string;
  category: string;
  amount: number;
  format: AmountFormat;
  bold?: boolean;
  tooltip?: string;
}

export const buildSupportItemBreakdownRows = (
  calculation: SupportItemCalculationFields,
  salaryConstants: SalaryConstants,
  otherConstants: OtherExpensesConstants,
  t: TFunction,
): SupportItemBreakdownRow[] => {
  const payRate = calculation.payRate ?? 0;
  const hoursPerWeek = calculation.hoursWorkedPerWeek ?? 0;
  const isSalaried =
    calculation.salaryOrHourly === DesignationSupportSalaryType.Salaried;
  const isSimple = calculation.formType === DesignationSupportFormType.Simple;

  const { monthlyBase, grossMonthlyPay, employerFica } = calculateSalaryTotals(
    calculation,
    salaryConstants,
  );
  const totals: OtherExpensesTotals = calculateOtherExpenses(
    calculation,
    otherConstants,
  );

  return [
    {
      id: 'pay-rate',
      category: t('Pay Rate'),
      amount: payRate,
      format: 'currency',
    },
    ...(isSalaried
      ? []
      : [
          {
            id: 'hours-per-week',
            category: t('Hours per Week'),
            amount: hoursPerWeek,
            format: 'number' as const,
          },
        ]),
    {
      id: 'monthly-base',
      category: t('Monthly Base'),
      amount: monthlyBase,
      format: 'currency',
    },
    {
      id: 'gross-monthly-pay',
      category: t('Gross Monthly Pay'),
      amount: grossMonthlyPay,
      format: 'currency',
    },
    {
      id: 'employer-fica',
      category: t('Employer ½ FICA'),
      amount: employerFica,
      format: 'currency',
    },
    ...(isSimple
      ? []
      : [
          {
            id: 'reimbursable-expenses',
            category: t('Reimbursable Expenses'),
            amount: totals.reimbursableExpenses,
            format: 'currency' as const,
            tooltip: t(
              'To change this amount, update the Reimbursable Expenses step',
            ),
          },
          {
            id: '403b-contributions',
            category: t('403b Contributions if Applicable'),
            amount: totals.fourOThreeBContributions,
            format: 'currency' as const,
          },
        ]),
    ...(calculation.status === DesignationSupportStatus.PartTime
      ? [
          {
            id: 'work-comp',
            category: t('Work Comp for Part-time'),
            amount: totals.workComp,
            format: 'currency' as const,
          },
        ]
      : []),
    ...(calculation.status === DesignationSupportStatus.FullTime
      ? [
          {
            id: 'benefits',
            category: t('Benefits for Full-time'),
            amount: totals.benefits,
            format: 'currency' as const,
          },
        ]
      : []),
    {
      id: 'subtotal',
      category: t('Subtotal'),
      amount: totals.subtotal,
      format: 'currency',
      bold: true,
    },
    {
      id: 'attrition',
      category: t('Attrition'),
      amount: totals.attrition,
      format: 'currency',
      bold: true,
    },
    {
      id: 'credit-card-fees',
      category: t('Credit Card Fees'),
      amount: totals.creditCardFees,
      format: 'currency',
      bold: true,
    },
    {
      id: 'assessment',
      category: t('Assessment'),
      amount: totals.assessment,
      format: 'currency',
      bold: true,
    },
  ];
};

export const buildSupportItemBreakdownColumns = (
  locale: string,
  t: TFunction,
): GridColDef<SupportItemBreakdownRow>[] => [
  {
    field: 'category',
    headerName: t('Category'),
    flex: 1,
    minWidth: 200,
    cellClassName: 'category-cell',
    renderCell: (params: GridRenderCellParams<SupportItemBreakdownRow>) => (
      <CategoryCellBox>
        {params.row.category}
        {params.row.tooltip && (
          <Tooltip title={params.row.tooltip}>
            <InfoIcon
              color="action"
              fontSize="small"
              tabIndex={0}
              titleAccess={params.row.tooltip}
            />
          </Tooltip>
        )}
      </CategoryCellBox>
    ),
  },
  {
    field: 'amount',
    headerName: t('Amount'),
    flex: 1,
    minWidth: 140,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<SupportItemBreakdownRow>) => {
      const { id, amount, format } = params.row;
      const formatted =
        format === 'number'
          ? numberFormat(amount, locale)
          : currencyFormat(amount, 'USD', locale);
      return <span data-testid={id}>{formatted}</span>;
    },
  },
];
