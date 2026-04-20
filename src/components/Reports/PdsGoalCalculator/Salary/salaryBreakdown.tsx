import React from 'react';
import { Box, styled } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { TFunction } from 'i18next';
import { DesignationSupportSalaryType } from 'src/graphql/types.generated';
import {
  currencyFormat,
  numberFormat,
  percentageFormat,
} from 'src/lib/intlFormat';
import {
  SalaryCalculationFields,
  SalaryConstants,
  calculateSalaryTotals,
} from '../calculations/salaryCalculation';

type AmountFormat = 'currency' | 'percentage' | 'number';

const CategoryCellBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100%',
});

export interface SalaryBreakdownRow {
  id: string;
  category: string;
  formula?: string;
  amount: number;
  format: AmountFormat;
  testId?: string;
}

export const buildSalaryBreakdownRows = (
  calculation: SalaryCalculationFields,
  constants: SalaryConstants,
  locale: string,
  t: TFunction,
): SalaryBreakdownRow[] => {
  const { geographicMultiplier, employerFicaRate } = constants;
  const { salaryOrHourly } = calculation;
  const payRate = calculation.payRate ?? 0;
  const hoursPerWeek = calculation.hoursWorkedPerWeek ?? 0;
  const isSalaried = salaryOrHourly === DesignationSupportSalaryType.Salaried;

  const { monthlyBase, grossMonthlyPay, employerFica, subtotal } =
    calculateSalaryTotals(calculation, constants);

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
      formula: isSalaried
        ? t('Yearly Salary ÷ 12')
        : t('Pay Rate × Hours per Week × 52 ÷ 12'),
      amount: monthlyBase,
      format: 'currency',
    },
    {
      id: 'geographic-multiplier',
      category: t('Geographic Multiplier'),
      amount: geographicMultiplier,
      format: 'percentage',
    },
    {
      id: 'gross-monthly-pay',
      category: t('Gross Monthly Pay'),
      formula: t('Monthly Base × (1 + Geographic Multiplier)'),
      amount: grossMonthlyPay,
      format: 'currency',
      testId: 'gross-monthly-pay',
    },
    {
      id: 'employer-fica',
      category: t('Employer ½ FICA'),
      formula: t('Gross Monthly Pay × {{rate}}', {
        rate: percentageFormat(employerFicaRate, locale),
      }),
      amount: employerFica,
      format: 'currency',
      testId: 'employer-fica',
    },
    {
      id: 'total',
      category: t('Subtotal'),
      formula: t('Gross Monthly Pay + Employer ½ FICA'),
      amount: subtotal,
      format: 'currency',
      testId: 'salary-subtotal',
    },
  ];
};

export const buildSalaryBreakdownColumns = (
  locale: string,
  t: TFunction,
): GridColDef<SalaryBreakdownRow>[] => [
  {
    field: 'category',
    headerName: t('Category'),
    flex: 1,
    minWidth: 200,
    cellClassName: 'category-cell',
    renderCell: (params: GridRenderCellParams<SalaryBreakdownRow>) => (
      <CategoryCellBox>
        {params.row.category}
        {params.row.formula && (
          <span className="category-formula">{params.row.formula}</span>
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
    renderCell: (params: GridRenderCellParams<SalaryBreakdownRow>) => {
      const { amount, format, testId } = params.row;
      const formatted =
        format === 'currency'
          ? currencyFormat(amount, 'USD', locale)
          : format === 'percentage'
            ? percentageFormat(amount, locale)
            : numberFormat(amount, locale);
      return <span data-testid={testId}>{formatted}</span>;
    },
  },
];
