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
import { StyledTableRow } from '../../styledComponents';
import {
  FundTypeEnum,
  ScheduleEnum,
  TableTypeEnum,
  Transfers,
} from '../mockData';

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
              <TableCell>{t('Transfer Date')}</TableCell>
              <TableCell>{t('Stop Date')}</TableCell>
              <TableCell>{t('Note')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.length ? (
              transfers.map((transfer) => (
                <StyledTableRow key={transfer.id}>
                  <TableCell>
                    {transfer.transferFrom === FundTypeEnum.Primary
                      ? t('Primary Account')
                      : transfer.transferFrom === FundTypeEnum.Savings
                        ? t('Savings Account')
                        : t('Conference Savings Account')}
                  </TableCell>
                  <TableCell>
                    {transfer.transferTo === FundTypeEnum.Primary
                      ? t('Primary Account')
                      : transfer.transferTo === FundTypeEnum.Savings
                        ? t('Savings Account')
                        : t('Conference Savings Account')}
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
                      ? transfer.transferDate.toFormat('MMM d, yyyy')
                      : ''}
                  </TableCell>
                  <TableCell>
                    {transfer.schedule === ScheduleEnum.Monthly &&
                    transfer.endDate
                      ? transfer.endDate.toFormat('MMM d, yyyy')
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
