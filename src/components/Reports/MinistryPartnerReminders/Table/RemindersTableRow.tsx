import { TableCell, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import {
  PrintOnly,
  ScreenOnly,
} from '../../SavingsFundTransfer/styledComponents/DisplayStyling';
import { ReminderData } from '../mockData';
import { RowValues } from './RemindersTable';
import { StatusSelect } from './StatusSelect/StatusSelect';

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
      </TableCell>
      <TableCell>{dateFormat(lastGift, locale)}</TableCell>
      <TableCell>{dateFormat(lastReminder, locale)}</TableCell>
      <ScreenOnly>
        <TableCell>
          <StatusSelect
            name={`status.${id}`}
            value={values.status[id]}
            onChange={handleChange}
            onBlur={handleBlur}
            labelId="status-col"
          />
        </TableCell>
      </ScreenOnly>
      <PrintOnly>
        <TableCell>{t(values.status[id])}</TableCell>
      </PrintOnly>
    </>
  );
};
