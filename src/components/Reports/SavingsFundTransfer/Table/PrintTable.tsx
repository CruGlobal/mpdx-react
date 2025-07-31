import React from 'react';
import {
  Chip,
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
import { Status } from '../Helper/TransferHistoryEnum';
import { StaffSavingFund, TransferHistory } from '../mockData';

interface PrintTableProps {
  transfers: TransferHistory[];
}

export const PrintTable: React.FC<PrintTableProps> = ({ transfers }) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h6" sx={{ mt: 2 }}>
        {t('Transfer History')}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '8pt', width: '20%' }}>
                {t('From')}
              </TableCell>
              <TableCell sx={{ fontSize: '8pt', width: '20%' }}>
                {t('To')}
              </TableCell>
              <TableCell sx={{ fontSize: '8pt', width: '5%' }}>
                {t('Amount')}
              </TableCell>
              <TableCell sx={{ fontSize: '8pt', width: '5%' }}>
                {t('Schedule')}
              </TableCell>
              <TableCell sx={{ fontSize: '8pt', width: '5%' }}>
                {t('Status')}
              </TableCell>
              <TableCell sx={{ fontSize: '8pt', width: '15%' }}>
                {t('Transfer Date')}
              </TableCell>
              <TableCell sx={{ fontSize: '8pt', width: '15%' }}>
                {t('Stop Date')}
              </TableCell>
              <TableCell sx={{ fontSize: '8pt', width: '15%' }}>
                {t('Note')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.length ? (
              transfers.map((transfer) => (
                <TableRow
                  key={`${transfer.transferFrom}-${transfer.transferTo}-${transfer.amount}-${transfer.transferDate}`}
                >
                  <TableCell sx={{ fontSize: '8pt' }}>
                    {transfer.transferFrom === StaffSavingFund.StaffAccount
                      ? 'Staff Account'
                      : transfer.transferFrom === StaffSavingFund.StaffSavings
                      ? 'Staff Savings'
                      : 'Staff Conference Savings'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '8pt' }}>
                    {transfer.transferTo === StaffSavingFund.StaffAccount
                      ? 'Staff Account'
                      : transfer.transferTo === StaffSavingFund.StaffSavings
                      ? 'Staff Savings'
                      : 'Staff Conference Savings'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '8pt' }}>
                    {transfer.amount}
                  </TableCell>
                  <TableCell sx={{ fontSize: '8pt' }}>
                    {transfer.schedule}
                  </TableCell>
                  <TableCell>
                    {transfer.status === Status.Pending ? (
                      <Chip
                        label={transfer.status}
                        color="default"
                        size="small"
                        sx={{
                          '@media print': {
                            backgroundColor: '#FFF8E1',
                            boxShadow: 'none',
                            fontSize: '8pt',
                          },
                        }}
                      />
                    ) : transfer.status === Status.Ongoing ? (
                      <Chip
                        label={t(transfer.status)}
                        color="default"
                        size="small"
                        sx={{
                          backgroundColor: '#E3F2FD',
                          boxShadow: 'none',
                          fontSize: '8pt',
                        }}
                      />
                    ) : transfer.status === Status.Complete ? (
                      <Chip
                        label={t(transfer.status)}
                        color="default"
                        size="small"
                        sx={{
                          backgroundColor: '#E8F5E9',
                          boxShadow: 'none',
                          fontSize: '8pt',
                        }}
                      />
                    ) : transfer.status === Status.Ended ? (
                      <Chip
                        label={t(transfer.status)}
                        color="default"
                        size="small"
                        sx={{
                          backgroundColor: '#FAFAFA',
                          boxShadow: 'none',
                          fontSize: '8pt',
                        }}
                      />
                    ) : transfer.status === Status.Failed ? (
                      <Chip
                        label={t(transfer.status)}
                        color="default"
                        size="small"
                        sx={{
                          backgroundColor: '#FEEBEE',
                          boxShadow: 'none',
                          fontSize: '8pt',
                        }}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell sx={{ fontSize: '8pt' }}>
                    {transfer.transferDate?.toLocaleString(DateTime.DATE_MED)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '8pt' }}>
                    {transfer.endDate?.toLocaleString(DateTime.DATE_MED)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '8pt' }}>
                    {transfer.note}
                  </TableCell>
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
