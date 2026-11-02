import { Box, TableCell, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import { ReminderData } from '../mockData';
import { RowValues } from './RemindersTable';
import { StatusSelect } from './StatusSelect/StatusSelect';

// On phones the date columns are stacked under the partner instead
export const hideOnPhone = { display: { xs: 'none', sm: 'table-cell' } };

interface RemindersTableRowProps {
  row: ReminderData;
  id: string;
}

export const RemindersTableRow: React.FC<RemindersTableRowProps> = ({
  row,
  id,
}) => {
  const { partner, partnerId, lastGift, lastReminder } = row;
  const { t } = useTranslation();
  const locale = useLocale();

  const { values, handleChange, handleBlur } = useFormikContext<RowValues>();

  return (
    <>
      <TableCell>
        <Typography sx={{ fontSize: '14px' }}>{partner}</Typography>
        <Typography sx={{ fontSize: '14px' }}>
          {partnerId ? t('({{partnerId}})', { partnerId }) : t('(N/A)')}
        </Typography>
        <Box sx={{ display: { sm: 'none' } }}>
          {lastGift && (
            <Typography sx={{ fontSize: '14px' }} color="textSecondary">
              {t('Last Gift: {{date}}', {
                date: dateFormat(lastGift, locale),
              })}
            </Typography>
          )}
          {lastReminder && (
            <Typography sx={{ fontSize: '14px' }} color="textSecondary">
              {t('Last Reminder: {{date}}', {
                date: dateFormat(lastReminder, locale),
              })}
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell sx={hideOnPhone}>{dateFormat(lastGift, locale)}</TableCell>
      <TableCell sx={hideOnPhone}>{dateFormat(lastReminder, locale)}</TableCell>
      <TableCell>
        <StatusSelect
          name={`status.${id}`}
          value={values.status[id]}
          onChange={handleChange}
          onBlur={handleBlur}
          labelId="status-col"
          aria-label={t('Reminder Status')}
        />
      </TableCell>
    </>
  );
};
