import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Divider,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useTranslation } from 'react-i18next';
import { ExpectedMonthlyTotalReportEmpty } from '../ExpectedMonthlyTotalReport/Empty/ExpectedMonthlyTotalReportEmpty';
import theme from '../../../theme';
import { GetDashboardQuery } from '../../../../pages/accountLists/GetDashboard.generated';

export interface Donation {
  date: string;
  partnerId: string;
  partner: string;
  amount: string;
  foreignAmount: string;
  designation: string;
  method: string;
}

interface Props {
  data: Donation[];
  accountListId: string;
  empty: boolean;
}

export const DonationsReportTable: React.FC<Props> = ({
  data,
  accountListId,
  empty,
}) => {
  const { t } = useTranslation();

  const [month, setMonth] = useState('June 2021');

  const prevMonth = () => {
    return 'disabled';
  };
  return (
    <>
      <Box style={{ display: 'flex', margin: 8 }}>
        <Typography variant="h6">{month}</Typography>
        <Button
          style={{ marginLeft: 'auto' }}
          variant="contained"
          startIcon={<ChevronLeftIcon />}
          size="small"
        >
          Previous Month
        </Button>
        <Button variant="contained" endIcon={<ChevronRightIcon />} size="small">
          Next Month
        </Button>
      </Box>
      <Divider style={{ margin: 12 }} variant="middle"></Divider>
      {!empty ? (
        <Box>
          <TableContainer component={Paper}>
            <Table style={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <TableCell align="left">{t('Date')}</TableCell>
                  <TableCell align="left">{t('Partner')}</TableCell>
                  <TableCell align="right">{t('Amount')}</TableCell>
                  <TableCell align="right">{t('Foreign Amount')}</TableCell>
                  <TableCell align="right">{t('Designation')}</TableCell>
                  <TableCell align="right">{t('Method')}</TableCell>
                  <TableCell align="left">{t('Appeal')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={row.partnerId}
                    style={{
                      backgroundColor:
                        index % 2
                          ? theme.palette.common.white
                          : theme.palette.cruGrayLight.main,
                    }}
                  >
                    <TableCell align="left">{t(row.date)}</TableCell>
                    <TableCell align="left">
                      <Link href="../../../pages/accountLists/[accountListId]/contacts/[[...contactId]].page.tsx">
                        {row.partner}
                      </Link>
                    </TableCell>
                    <TableCell align="right">{t(row.amount)}</TableCell>
                    <TableCell align="right">{row.foreignAmount}</TableCell>
                    <TableCell align="right">{t(row.designation)}</TableCell>
                    <TableCell align="right">{t(row.method)}</TableCell>
                    <TableCell align="left"></TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    {t('Total Donations: 1,234 CAD')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <ExpectedMonthlyTotalReportEmpty />
      )}
    </>
  );
};
