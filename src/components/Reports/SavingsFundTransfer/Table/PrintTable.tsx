import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import {
  ScheduleEnum,
  StaffSavingFundEnum,
  TransferHistory,
} from '../mockData';

interface PrintTableProps {
  transfers: TransferHistory[];
}

export const PrintTable: React.FC<PrintTableProps> = ({ transfers }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2 }}>
        {t('Transfer History')}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('From')}</TableCell>
              <TableCell>{t('To')}</TableCell>
              <TableCell>{t('Amount')}</TableCell>
              <TableCell>{t('Schedule')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
              <TableCell>{t('Transfer Date')}</TableCell>
              <TableCell>{t('Stop Date')}</TableCell>
              <TableCell>{t('Note')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.length ? (
              transfers.map((transfer) => (
                <TableRow
                  key={`${transfer.transferFrom}-${transfer.transferTo}-${transfer.amount}-${transfer.transferDate}`}
                >
                  <TableCell>
                    {transfer.transferFrom === StaffSavingFundEnum.StaffAccount
                      ? 'Staff Account'
                      : transfer.transferFrom ===
                          StaffSavingFundEnum.StaffSavings
                        ? 'Staff Savings'
                        : 'Staff Conference Savings'}
                  </TableCell>
                  <TableCell>
                    {transfer.transferTo === StaffSavingFundEnum.StaffAccount
                      ? 'Staff Account'
                      : transfer.transferTo === StaffSavingFundEnum.StaffSavings
                        ? 'Staff Savings'
                        : 'Staff Conference Savings'}
                  </TableCell>
                  <TableCell>
                    {transfer.amount?.toLocaleString(locale, {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </TableCell>
                  <TableCell>
                    {transfer.schedule === ScheduleEnum.OneTime
                      ? 'One Time'
                      : 'Monthly'}
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {transfer.status}
                  </TableCell>
                  <TableCell>
                    {transfer.transferDate?.toLocaleString(DateTime.DATE_MED)}
                  </TableCell>
                  <TableCell>
                    {transfer.endDate?.toLocaleString(DateTime.DATE_MED)}
                  </TableCell>
                  <TableCell>{transfer.note}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {t('No transfer history available.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
