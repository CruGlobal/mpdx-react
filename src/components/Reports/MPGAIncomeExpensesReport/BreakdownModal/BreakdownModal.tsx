import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, monthYearFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { DialogSkeleton } from '../../Shared/DialogSkeleton/DialogSkeleton';
import { getLocalizedCategory } from '../../Shared/Helpers/transformStaffExpenseEnums';
import { BreakdownAccordion } from '../BreakdownAccordion/BreakdownAccordion';
import { useMPGAIncomeExpenses } from '../MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { BreakdownTarget, TransactionBreakdown } from '../mockData';

export interface BreakdownModalProps extends BreakdownTarget {
  open: boolean;
  onClose: () => void;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({
  open,
  onClose,
  category,
  person,
  transactions,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';
  const { startDate, endDate } = useMPGAIncomeExpenses();

  // Salary is the only category split one row per person. Its breakdown is named the way the row
  // is, so two people's modals cannot be mistaken for each other; no other category names anyone.
  const categoryName =
    person && category === StaffExpenseCategoryEnum.Salary
      ? t('{{bucket}} ({{person}})', {
          bucket: getLocalizedCategory(category, t),
          person,
        })
      : getLocalizedCategory(category, t);

  const subcategoryBreakdown = useMemo(() => {
    const grouped = new Map<
      StaffExpensesSubCategoryEnum,
      TransactionBreakdown[]
    >();

    transactions.forEach((transaction) => {
      const existing = grouped.get(transaction.subCategory);
      if (existing) {
        existing.push(transaction);
      } else {
        grouped.set(transaction.subCategory, [transaction]);
      }
    });

    return Array.from(grouped, ([subCategory, subCategoryTransactions]) => ({
      category,
      subCategory,
      transactions: subCategoryTransactions,
      total: subCategoryTransactions.reduce(
        (sum, { amount }) => sum + amount,
        0,
      ),
    }));
  }, [transactions, category]);

  const overallTotal = useMemo(
    () => subcategoryBreakdown.reduce((sum, { total }) => sum + total, 0),
    [subcategoryBreakdown],
  );

  return (
    <DialogSkeleton categoryName={categoryName} open={open} onClose={onClose}>
      <TableContainer
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: theme.palette.mpdxGrayLight.main,
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <TableCell>{t('Category')}</TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                {`${monthYearFormat(
                  startDate.month,
                  startDate.year,
                  locale,
                  true,
                  true,
                )} - ${monthYearFormat(
                  endDate.month,
                  endDate.year,
                  locale,
                  true,
                  true,
                )}`}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subcategoryBreakdown.map(
              ({
                subCategory,
                transactions: subCategoryTransactions,
                total,
              }) => (
                <TableRow key={subCategory}>
                  <TableCell colSpan={2} sx={{ padding: 0, border: 0 }}>
                    <BreakdownAccordion
                      category={category}
                      subCategory={subCategory}
                      transactions={subCategoryTransactions}
                      total={total}
                    />
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
          <TableFooter
            sx={{
              '& .MuiTableCell-footer': {
                position: 'sticky',
                bottom: 0,
                backgroundColor: 'background.paper',
                borderBottom: 0,
              },
            }}
          >
            <TableRow>
              <TableCell>
                <Typography
                  color={theme.palette.text.primary}
                  fontWeight="bold"
                >
                  {overallTotal >= 0
                    ? t('Total {{category}} Income', { category: categoryName })
                    : t('Total {{category}} Expense', {
                        category: categoryName,
                      })}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  fontWeight="bold"
                  sx={{
                    color:
                      overallTotal >= 0
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  }}
                >
                  {currencyFormat(Math.abs(overallTotal), currency, locale, {
                    showTrailingZeros: true,
                  })}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </DialogSkeleton>
  );
};
