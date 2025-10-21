import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import { StyledTableRow } from '../../styledComponents';
import { ReminderData } from '../mockData';

interface PrintTableProps {
  data: ReminderData[];
}

export const PrintTable: React.FC<PrintTableProps> = ({ data }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('Ministry Partner')}</TableCell>
            <TableCell>{t('Last Gift')}</TableCell>
            <TableCell>{t('Last Reminder')}</TableCell>
            <TableCell>{t('Status')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <StyledTableRow key={row.id}>
              <TableCell>{row.partner}</TableCell>
              <TableCell>{dateFormat(row.lastGift, locale)}</TableCell>
              <TableCell>{dateFormat(row.lastReminder, locale)}</TableCell>
              <TableCell>{t(row.status)}</TableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
