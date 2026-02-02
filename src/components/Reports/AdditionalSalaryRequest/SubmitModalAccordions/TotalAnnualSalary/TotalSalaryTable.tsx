import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';

const StyledTableCell = styled(TableCell)(() => {
  return {
    fontWeight: 'normal',
  };
});

export const TotalSalaryTable: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  return (
    <Table sx={{ mt: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '70%', fontWeight: 'normal' }}>
            {t('Description')}
          </TableCell>
          <TableCell sx={{ width: '30%', fontWeight: 'normal' }}>
            {t('Amount')}
          </TableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell>{t('Maximum Allowable Salary')}</StyledTableCell>
          <StyledTableCell>
            {currencyFormat(0, currency, locale, {
              showTrailingZeros: true,
            })}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell>{t('Gross Annual Salary')}</StyledTableCell>
          <StyledTableCell>
            {currencyFormat(0, currency, locale, {
              showTrailingZeros: true,
            })}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell>
            <Typography variant="body2">
              {t('Additional Salary Received This Year')}
            </Typography>
            <Typography variant="caption">
              {t('Does not include payments received for backpay.')}
            </Typography>
          </StyledTableCell>
          <StyledTableCell>
            {currencyFormat(0, currency, locale, {
              showTrailingZeros: true,
            })}
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell>
            <Typography variant="body2">
              {t('Additional Salary on this Request')}
            </Typography>
            <Typography variant="caption">
              {t('Does not include requests made for backpay.')}
            </Typography>
          </StyledTableCell>
          <StyledTableCell>
            {currencyFormat(0, currency, locale, {
              showTrailingZeros: true,
            })}
          </StyledTableCell>
        </TableRow>
        <TableRow
          sx={{
            '& td, & th': { borderBottom: 'none' },
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          }}
        >
          <TableCell>{t('Total Annual Salary:')}</TableCell>
          <TableCell sx={{ color: 'warning.dark' }}>
            {currencyFormat(0, currency, locale, {
              showTrailingZeros: true,
            })}
          </TableCell>
        </TableRow>
      </TableHead>
    </Table>
  );
};
