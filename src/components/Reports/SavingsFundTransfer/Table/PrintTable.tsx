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
import { StyledTableRow } from '../../styledComponents';
import { FundTypeEnum, ScheduleEnum, TransferHistory } from '../mockData';

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
                <StyledTableRow
                  key={`${transfer.transferFrom}-${transfer.transferTo}-${transfer.amount}-${transfer.transferDate}`}
                >
                  <TableCell>
                    {transfer.transferFrom === FundTypeEnum.Primary
                      ? t('Primary Balance')
                      : transfer.transferFrom === FundTypeEnum.Savings
                        ? t('Savings Balance')
                        : t('Conference Savings Balance')}
                  </TableCell>
                  <TableCell>
                    {transfer.transferTo === FundTypeEnum.Primary
                      ? t('Primary Balance')
                      : transfer.transferTo === FundTypeEnum.Savings
                        ? t('Savings Balance')
                        : t('Conference Savings Balance')}
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
                  <TableCell>
                    {transfer.transferDate
                      ? dateFormat(transfer.transferDate, locale)
                      : ''}
                  </TableCell>
                  <TableCell>
                    {transfer.schedule === ScheduleEnum.Monthly &&
                    transfer.endDate
                      ? dateFormat(transfer.endDate, locale)
                      : ''}
                  </TableCell>
                  <TableCell>{transfer.note}</TableCell>
                </StyledTableRow>
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
