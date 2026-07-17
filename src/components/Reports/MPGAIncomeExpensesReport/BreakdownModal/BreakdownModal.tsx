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
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { DialogSkeleton } from '../../Shared/DialogSkeleton/DialogSkeleton';
import { getLocalizedCategory } from '../../Shared/Helpers/transformStaffExpenseEnums';
import { BreakdownAccordion } from '../BreakdownAccordion/BreakdownAccordion';
import { TransactionBreakdown } from '../mockData';

export interface BreakdownModalProps {
  open: boolean;
  onClose: () => void;
  category: StaffExpenseCategoryEnum;
  breakdownData: Partial<Record<string, TransactionBreakdown[]>>;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({
  open,
  onClose,
  category,
  breakdownData,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { startDate, endDate } = useMemo(() => {
    const now = DateTime.now();
    return {
      startDate: now.minus({ months: 11 }).startOf('month'),
      endDate: now,
    };
  }, []);

  const subcategoryBreakdown = useMemo(() => {
    const categoryBreakdown = breakdownData[category] ?? [];
    const grouped = new Map<
      StaffExpensesSubCategoryEnum,
      TransactionBreakdown[]
    >();

    categoryBreakdown.forEach((transaction) => {
      const transactions = grouped.get(transaction.subCategory);
      if (transactions) {
        transactions.push(transaction);
      } else {
        grouped.set(transaction.subCategory, [transaction]);
      }
    });

    return Array.from(grouped, ([subCategory, transactions]) => ({
      category,
      subCategory,
      transactions,
      total: transactions.reduce((sum, { amount }) => sum + amount, 0),
    }));
  }, [breakdownData, category]);

  const overallTotal = useMemo(
    () => subcategoryBreakdown.reduce((sum, { total }) => sum + total, 0),
    [subcategoryBreakdown],
  );

  return (
    <DialogSkeleton
      categoryName={getLocalizedCategory(category, t)}
      open={open}
      onClose={onClose}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{ backgroundColor: theme.palette.mpdxGrayLight.main }}
            >
              <TableCell>{t('Category')}</TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                {t(
                  `${startDate.toFormat('LLLL yyyy')} - ${endDate.toFormat('LLLL yyyy')}`,
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subcategoryBreakdown.map(
              ({ subCategory, transactions, total }) => (
                <TableRow key={subCategory}>
                  <TableCell colSpan={2} sx={{ padding: 0, border: 0 }}>
                    <BreakdownAccordion
                      category={category}
                      subCategory={subCategory}
                      transactions={transactions}
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
                boxShadow: `inset 0 -1px 0 ${theme.palette.divider}`,
              },
            }}
          >
            <TableRow>
              <TableCell>
                <Typography
                  color={theme.palette.text.primary}
                  fontWeight="bold"
                >
                  {t(
                    `Total ${getLocalizedCategory(category, t)} ${overallTotal >= 0 ? 'Income' : 'Expense'}`,
                  )}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  fontWeight="bold"
                  sx={{
                    color:
                      overallTotal >= 0
                        ? theme.palette.statusSuccess.main
                        : theme.palette.chipRedDark.main,
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
