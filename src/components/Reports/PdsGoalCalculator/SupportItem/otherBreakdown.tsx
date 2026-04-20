import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Tooltip, styled } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { TFunction } from 'i18next';
import { DesignationSupportStatus } from 'src/graphql/types.generated';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import {
  OtherExpensesConstants,
  OtherExpensesFields,
  OtherExpensesTotals,
  calculateOtherExpenses,
} from '../calculations/OtherExpenses';

const CategoryCellBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100%',
});

export interface OtherBreakdownRow {
  id: string;
  category: string;
  formula?: string;
  amount: number;
  testId?: string;
  bold?: boolean;
  tooltip?: string;
}

export const buildOtherBreakdownRows = (
  calculation: OtherExpensesFields,
  constants: OtherExpensesConstants,
  locale: string,
  t: TFunction,
): OtherBreakdownRow[] => {
  const totals: OtherExpensesTotals = calculateOtherExpenses(
    calculation,
    constants,
  );

  const rows: OtherBreakdownRow[] = [
    {
      id: 'reimbursable-expenses',
      category: t('Reimbursable Expenses'),
      formula: t(
        'The greater of $300/month or the amount calculated in the Reimbursable Expenses step',
      ),
      amount: totals.reimbursableExpenses,
      testId: 'other-reimbursable-expenses',
      tooltip: t(
        'To change this amount, update the Reimbursable Expenses step',
      ),
    },
    {
      id: '403b-contributions',
      category: t('403b Contributions if Applicable'),
      formula: t(
        'Gross Monthly Pay from Salary section × 403b Contribution Percentage from Setup section',
      ),
      amount: totals.fourOThreeBContributions,
      testId: 'other-403b-contributions',
    },
    ...(calculation.status === DesignationSupportStatus.PartTime
      ? [
          {
            id: 'work-comp',
            category: t('Work Comp for Part-time'),
            amount: totals.workComp,
            testId: 'other-work-comp',
          },
        ]
      : []),
    ...(calculation.status === DesignationSupportStatus.FullTime
      ? [
          {
            id: 'benefits',
            category: t('Benefits for Full-time'),
            amount: totals.benefits,
            testId: 'other-benefits',
          },
        ]
      : []),
    {
      id: 'subtotal',
      category: t('Subtotal'),
      formula: t(
        'Gross Monthly Pay Subtotal + Reimbursable Expenses + 403b Contributions + Work Comp + Benefits',
      ),
      amount: totals.subtotal,
      testId: 'other-subtotal',
      bold: true,
    },
    {
      id: 'attrition',
      category: t('Attrition'),
      formula: t('Subtotal × {{rate}}', {
        rate: percentageFormat(constants.attritionRate, locale),
      }),
      amount: totals.attrition,
      testId: 'other-attrition',
      bold: true,
    },
    {
      id: 'credit-card-fees',
      category: t('Credit Card Fees'),
      formula: t('(Subtotal + Attrition) × {{rate}}', {
        rate: percentageFormat(constants.creditCardFeeRate, locale),
      }),
      amount: totals.creditCardFees,
      testId: 'other-credit-card-fees',
      bold: true,
    },
    {
      id: 'assessment',
      category: t('Assessment'),
      formula: t(
        '(Subtotal + Credit Card Fees + Attrition) ÷ (1 − Admin Rate) − (Subtotal + Credit Card Fees + Attrition)',
      ),
      amount: totals.assessment,
      testId: 'other-assessment',
      bold: true,
    },
  ];

  return rows;
};

export const buildOtherBreakdownColumns = (
  locale: string,
  t: TFunction,
): GridColDef<OtherBreakdownRow>[] => [
  {
    field: 'category',
    headerName: t('Category'),
    flex: 1,
    minWidth: 200,
    cellClassName: 'category-cell',
    renderCell: (params: GridRenderCellParams<OtherBreakdownRow>) => (
      <CategoryCellBox>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {params.row.category}
          {params.row.tooltip && (
            <Tooltip title={params.row.tooltip}>
              <InfoIcon
                color="action"
                fontSize="small"
                aria-label={params.row.tooltip}
              />
            </Tooltip>
          )}
        </Box>
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
    renderCell: (params: GridRenderCellParams<OtherBreakdownRow>) => {
      const { amount, testId } = params.row;
      return (
        <span data-testid={testId}>
          {currencyFormat(amount, 'USD', locale)}
        </span>
      );
    },
  },
];
