import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { BudgetFamilyCategoryEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import {
  calculateCategoryTotal,
  calculateFamilyTotal,
} from '../../Shared/calculateTotals';

const AmountRow: React.FC<{
  label: string;
  amount: string;
  bold?: boolean;
  indent?: boolean;
  topBorder?: boolean;
}> = ({ label, amount, bold = false, indent = false, topBorder = false }) => {
  const sx = {
    ...(bold && { fontWeight: 'bold' }),
    ...(topBorder && { borderTop: '2px solid black' }),
  };

  return (
    <TableRow>
      <TableCell sx={{ ...sx, ...(indent && { pl: 4 }) }}>{label}</TableCell>
      <TableCell align="right" sx={sx}>
        {amount}
      </TableCell>
    </TableRow>
  );
};

interface BudgetPrintTableProps {
  title: string;
  family: BudgetFamilyFragment;
}

/**
 * Plain table of a budget family's categories, line items, and totals for printing, since the
 * on-screen data grids do not print cleanly.
 */
export const BudgetPrintTable: React.FC<BudgetPrintTableProps> = ({
  title,
  family,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    goalCalculationResult: { data },
    goalTotals: { monthlyBudget },
    isMarried,
  } = useGoalCalculator();
  const goalCalculation = data?.goalCalculation;

  // Cents on every amount so the right-aligned column lines up
  const formatAmount = (amount: number) =>
    currencyFormat(amount, 'USD', locale, { showTrailingZeros: true });

  const categories = family.primaryBudgetCategories
    .map((category) => ({
      ...category,
      total: calculateCategoryTotal(category),
    }))
    .filter((category) => category.total !== 0);
  // The Categories Total, not a lump-sum family direct input
  const categoriesTotal = calculateFamilyTotal({
    ...family,
    directInput: null,
  });

  const firstName = goalCalculation?.firstName ?? '';
  const lastName = goalCalculation?.lastName ?? '';
  const spouseFirstName = isMarried ? goalCalculation?.spouseFirstName : null;
  const names = (
    spouseFirstName
      ? `${firstName} ${t('and')} ${spouseFirstName} ${lastName}`
      : `${firstName} ${lastName}`
  ).trim();

  return (
    <>
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
      {goalCalculation && (
        <>
          <Typography variant="subtitle1">{goalCalculation.name}</Typography>
          {names && <Typography variant="body2">{names}</Typography>}
        </>
      )}
      <Typography variant="body2" gutterBottom>
        {t('Printed {{date}}', {
          date: dateFormat(DateTime.now(), locale),
        })}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('Category')}</TableCell>
            <TableCell align="right">{t('Amount')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={2}>
                {t('No budget amounts entered')}
              </TableCell>
            </TableRow>
          )}
          {categories.map((category) => (
            <React.Fragment key={category.id}>
              <AmountRow
                label={category.label}
                amount={formatAmount(category.total)}
                bold
              />
              {typeof category.directInput !== 'number' &&
                category.subBudgetCategories
                  .filter((subCategory) => subCategory.amount !== 0)
                  .map((subCategory) => (
                    <AmountRow
                      key={subCategory.id}
                      label={subCategory.label}
                      amount={formatAmount(subCategory.amount)}
                      indent
                    />
                  ))}
            </React.Fragment>
          ))}
          <AmountRow
            label={t('Categories Total')}
            amount={formatAmount(categoriesTotal)}
            bold
            topBorder
          />
          {family.category === BudgetFamilyCategoryEnum.Household && (
            <AmountRow
              label={t('Monthly Budget')}
              amount={formatAmount(monthlyBudget)}
              bold
            />
          )}
        </TableBody>
      </Table>
    </>
  );
};
