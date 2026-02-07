import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import { StyledTableRow } from '../../styledComponents';
import { getReminderStatus } from '../Helper/getReminderStatus';
import { ReminderData } from '../mockData';

interface PrintTableProps {
  data: ReminderData[];
  error?: Error | null;
}

export const PrintTable: React.FC<PrintTableProps> = ({ data, error }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const noDesignation = error?.message.includes(
    'Designation account not found',
  );
  const isEmpty = data.length === 0;

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
          {noDesignation ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography>{t('No designation account found.')}</Typography>
              </TableCell>
            </TableRow>
          ) : isEmpty ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography>{t('No ministry partners found.')}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <StyledTableRow key={row.id}>
                <TableCell>
                  <Typography sx={{ fontSize: '14px' }}>
                    {row.partner}
                  </Typography>
                  <Typography sx={{ fontSize: '14px' }}>
                    {row.partnerId ? t(`${row.partnerId}`) : t('(N/A)')}
                  </Typography>
                </TableCell>
                <TableCell>{dateFormat(row.lastGift, locale)}</TableCell>
                <TableCell>{dateFormat(row.lastReminder, locale)}</TableCell>
                <TableCell>{t(getReminderStatus(row.status))}</TableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
