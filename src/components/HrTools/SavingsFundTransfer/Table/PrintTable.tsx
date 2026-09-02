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
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import { StyledTableRow } from '../../../Reports/styledComponents';
import { getEndDateLabel } from '../Helper/getEndDateLabel';
import { getFundLabel } from '../Helper/getFundLabel';
import { getNextPaymentDate } from '../Helper/getNextPaymentDate';
import { ScheduleEnum, TableTypeEnum, Transfers } from '../mockData';

interface PrintTableProps {
  transfers: Transfers[];
  type: TableTypeEnum;
}

export const PrintTable: React.FC<PrintTableProps> = ({ transfers, type }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2 }}>
        {type === TableTypeEnum.History
          ? t('Transfer History')
          : t('Upcoming Transfers')}
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
              <TableCell>{t('Start Date')}</TableCell>
              <TableCell>{t('Next Payment Date')}</TableCell>
              <TableCell>{t('End Date')}</TableCell>
              <TableCell>{t('Note')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.length ? (
              transfers.map((transfer) => {
                const startDate = transfer.transferDate?.isValid
                  ? dateFormat(transfer.transferDate, locale)
                  : '';
                const nextPaymentDate = dateFormat(
                  getNextPaymentDate(transfer),
                  locale,
                );

                return (
                  <StyledTableRow key={transfer.id}>
                    <TableCell>
                      {getFundLabel(transfer.transferFrom, t)}
                    </TableCell>
                    <TableCell>
                      {getFundLabel(transfer.transferTo, t)}
                    </TableCell>
                    <TableCell>
                      {transfer.amount?.toLocaleString(locale, {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </TableCell>
                    <TableCell>
                      {transfer.schedule === ScheduleEnum.OneTime
                        ? t('One Time')
                        : t('Monthly')}
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {transfer.status}
                    </TableCell>
                    <TableCell>{startDate}</TableCell>
                    <TableCell>{nextPaymentDate}</TableCell>
                    <TableCell>
                      {getEndDateLabel(transfer, locale, t('Indefinite'))}
                    </TableCell>
                    <TableCell>{transfer.note}</TableCell>
                  </StyledTableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
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
