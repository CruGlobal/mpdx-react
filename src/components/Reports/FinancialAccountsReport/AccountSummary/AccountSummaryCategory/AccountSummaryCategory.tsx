import NextLink from 'next/link';
import { Link, TableRow, Typography } from '@mui/material';
import { useLocale } from 'src/hooks/useLocale';
import { numberFormat } from 'src/lib/intlFormat';
import {
  Category,
  createTransactionsUrl,
  oneYearAgoDate,
  todaysDate,
} from '../AccountSummaryHelper';
import { StyledTableCell } from '../styledComponents';

interface CategoriesProps {
  category: Category;
  accountListId: string;
  financialAccountId: string;
}
export const AccountSummaryCategory: React.FC<CategoriesProps> = ({
  category,
  accountListId,
  financialAccountId,
}) => {
  const locale = useLocale();

  const transactionsUrl = createTransactionsUrl({
    accountListId,
    financialAccountId,
    startDate: oneYearAgoDate,
    endDate: todaysDate,
    categoryId: category.id,
  });
  return (
    <TableRow key={category.id}>
      <StyledTableCell component="th" scope="row">
        <Typography variant="body1" width="250px">
          <Link component={NextLink} href={transactionsUrl} shallow>
            {category.name}
          </Link>
        </Typography>
      </StyledTableCell>
      {category.months.map((month, idx) => {
        const url = createTransactionsUrl({
          accountListId,
          financialAccountId,
          startDate: month.startDate,
          endDate: month.endDate,
          categoryId: category.id,
        });

        return (
          <StyledTableCell key={`${idx}-${month.amount}`} align="right">
            <Link component={NextLink} href={url} shallow>
              {numberFormat(month.amount, locale)}
            </Link>
          </StyledTableCell>
        );
      })}
    </TableRow>
  );
};
