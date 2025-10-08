import { TableCell, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import {
  PrintOnly,
  ScreenOnly,
} from '../../SavingsFundTransfer/styledComponents/DisplayStyling';
import { ReminderData } from '../mockData';
import { StatusSelect } from './StatusSelect/StatusSelect';
import type { SelectChangeEvent } from '@mui/material';

interface RemindersTableRowProps {
  row: ReminderData;
  id: string;
  handleChange: (
    event: SelectChangeEvent<unknown>,
    child?: React.ReactNode,
  ) => void;
  handleBlur: React.FocusEventHandler<Element>;
  value: string;
}

export const RemindersTableRow: React.FC<RemindersTableRowProps> = ({
  row,
  id,
  handleChange,
  handleBlur,
  value,
}) => {
  const { partner, partnerId, lastGift, lastReminder } = row;
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <>
      <TableCell>
        <Typography sx={{ fontSize: '14px' }}>{partner}</Typography>
        <Typography sx={{ fontSize: '14px' }}>
          {t('(')}
          {partnerId}
          {t(')')}
        </Typography>
      </TableCell>
      <TableCell>{dateFormat(lastGift, locale)}</TableCell>
      <TableCell>{dateFormat(lastReminder, locale)}</TableCell>
      <ScreenOnly>
        <TableCell>
          <StatusSelect
            name={`status.${id}`}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            labelId="status-col"
          />
        </TableCell>
      </ScreenOnly>
      <PrintOnly>
        <TableCell>{t(value)}</TableCell>
      </PrintOnly>
    </>
  );
};
