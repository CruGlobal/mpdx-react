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
import { useReport } from '../ReportContext/ReportContext';
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
  const { startDate, endDate } = useReport();

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
                    ? t('Total {{category}} Income', {
                        category: getLocalizedCategory(category, t),
                      })
                    : t('Total {{category}} Expense', {
                        category: getLocalizedCategory(category, t),
                      })}
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
