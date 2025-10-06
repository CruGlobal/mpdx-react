import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import {
  PrintOnly,
  ScreenOnly,
} from '../../SavingsFundTransfer/styledComponents/DisplayStyling';
import { ReminderData } from '../mockData';
import { StyledRow } from '../styledComponents';
import { StatusSelect } from './StatusSelect/StatusSelect';

interface RemindersTableProps {
  data: ReminderData[];
}
export const RemindersTable: React.FC<RemindersTableProps> = ({ data }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('Ministry Partner')}</TableCell>
              <TableCell>{t('Last Gift')}</TableCell>
              <TableCell>{t('Last Reminder')}</TableCell>
              <TableCell id="status-col">{t('Reminder Status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <StyledRow key={row.id}>
                <TableCell>{row.partner}</TableCell>
                <TableCell>{dateFormat(row.lastGift, locale)}</TableCell>
                <TableCell>{dateFormat(row.lastReminder, locale)}</TableCell>
                <Formik
                  initialValues={{ status: row.status }}
                  onSubmit={() => {}}
                >
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
              </StyledRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
