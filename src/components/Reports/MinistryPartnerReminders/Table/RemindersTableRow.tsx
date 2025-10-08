import { TableCell, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import {
  PrintOnly,
  ScreenOnly,
} from '../../SavingsFundTransfer/styledComponents/DisplayStyling';
import { ReminderData } from '../mockData';
import { StatusSelect } from './StatusSelect/StatusSelect';

interface RemindersTableRowProps {
  row: ReminderData;
}

export const RemindersTableRow: React.FC<RemindersTableRowProps> = ({
  row,
}) => {
  const { partner, partnerId, lastGift, lastReminder, status } = row;
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
      <Formik initialValues={{ status }} onSubmit={() => {}}>
        {({ handleChange, handleBlur, values }) => (
          <>
            <ScreenOnly>
              <TableCell>
                <StatusSelect
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  labelId="status-col"
                />
              </TableCell>
            </ScreenOnly>
            <PrintOnly>
              <TableCell>{t(values.status)}</TableCell>
            </PrintOnly>
          </>
        )}
      </Formik>
    </>
  );
};
