import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { accordionShared } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import {
  getLocalizedCategory,
  getLocalizedSubCategory,
} from '../../Shared/Helpers/transformStaffExpenseEnums';
import { TransactionBreakdown } from '../mockData';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderTop: 0,
  ...accordionShared,
}));

export interface BreakdownAccordionProps {
  category: StaffExpenseCategoryEnum;
  subCategory: StaffExpensesSubCategoryEnum;
  transactions: TransactionBreakdown[];
  total: number;
}

export const BreakdownAccordion: React.FC<BreakdownAccordionProps> = ({
  category,
  subCategory,
  transactions,
  total,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const localizedCategory = getLocalizedCategory(category, t);
  const localizedSubCategory = getLocalizedSubCategory(subCategory, t);

  const title =
    localizedCategory === localizedSubCategory
      ? localizedCategory
      : `${localizedCategory} - ${localizedSubCategory}`;

  const isIncomeTotal = total >= 0;

  return (
    <StyledAccordion disableGutters square>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography component="span">{title}</Typography>
        <Typography
          component="span"
          sx={{
            marginLeft: 'auto',
            color: isIncomeTotal
              ? theme.palette.statusSuccess.main
              : theme.palette.chipRedDark.main,
          }}
        >
          {currencyFormat(Math.abs(total), currency, locale, {
            showTrailingZeros: true,
          })}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ paddingX: 0 }}>
        <TableContainer>
          <Table
            size="small"
            sx={{
              '& tbody tr:last-of-type td': {
                borderBottom: 0,
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{ backgroundColor: theme.palette.mpdxGrayLight.main }}
              >
                <TableCell>{t('Date')}</TableCell>
                <TableCell>{t('Description')}</TableCell>
                <TableCell align="right">{t('Amount')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction, index) => {
                const isIncomeTransaction = transaction.amount >= 0;

                const isStrayIncomeTransaction =
                  !isIncomeTotal && isIncomeTransaction;
                const isStrayExpenseTransaction =
                  isIncomeTotal && !isIncomeTransaction;
                const isStrayTransaction =
                  isStrayExpenseTransaction || isStrayIncomeTransaction;

                const formattedAmount = currencyFormat(
                  Math.abs(transaction.amount),
                  currency,
                  locale,
                  {
                    showTrailingZeros: true,
                  },
                );

                return (
                  <TableRow key={index}>
                    <TableCell align="left">
                      {dateFormat(DateTime.fromISO(transaction.date), locale)}
                    </TableCell>
                    <TableCell align="left">
                      {transaction.description}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: isStrayExpenseTransaction
                          ? theme.palette.chipRedDark.main
                          : isStrayIncomeTransaction
                            ? theme.palette.statusSuccess.main
                            : null,
                      }}
                    >
                      {isStrayTransaction
                        ? `(${formattedAmount})`
                        : formattedAmount}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </StyledAccordion>
  );
};
