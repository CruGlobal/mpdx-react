import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Link,
  Divider,
  styled,
  Table,
  TableCell,
  TableRow,
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef, GridCellParams } from '@material-ui/data-grid';
import { DateTime } from 'luxon';
import { EmptyDonationsTable } from '../../../common/EmptyDonationsTable/EmptyDonationsTable';

interface Donation {
  date: Date;
  partnerId: string;
  partner: string;
  currency: string;
  foreignCurrency: string;
  convertedAmount: number;
  foreignAmount: number;
  designation: string;
  method: string;
  id: string;
}

interface Props {
  data: Donation[];
  accountListId: string;
}

const DataTable = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& .MuiDataGrid-row.Mui-even:not(:hover)': {
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.common.white
        : theme.palette.cruGrayLight.main,
  },
}));

export const DonationsReportTable: React.FC<Props> = ({
  data,
  accountListId,
}) => {
  const { t } = useTranslation();

  const accountCurrency = data[0].currency;

  const link = (params: GridCellParams) => {
    const row = params.row as Donation;
    return (
      <Typography>
        <Link href={`../../${accountListId}/contacts/${row.partnerId}`}>
          {params.value}
        </Link>
      </Typography>
    );
  };

  const amount = (params: GridCellParams) => {
    const row = params.row as Donation;

    return (
      <Typography>
        {row.convertedAmount} {row.currency}
      </Typography>
    );
  };

  const foreignAmount = (params: GridCellParams) => {
    const row = params.row as Donation;
    return (
      <Typography>
        {row.foreignAmount} {row.foreignCurrency}
      </Typography>
    );
  };

  const button = () => (
    <IconButton color="primary">
      <EditIcon />
    </IconButton>
  );

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('Date'),
      type: 'date',
      width: 160,
    },
    {
      field: 'partner',
      headerName: t('Partner'),
      width: 220,
      renderCell: link,
    },
    {
      field: 'convertedAmount',
      headerName: t('Amount'),
      width: 160,
      renderCell: amount,
    },
    {
      field: 'foreignAmount',
      headerName: t('Foreign Amount'),
      width: 180,
      renderCell: foreignAmount,
    },
    {
      field: 'designation',
      headerName: t('Designation'),
      width: 220,
    },
    {
      field: 'method',
      headerName: t('Method'),
      width: 160,
    },
    {
      field: 'appeal',
      headerName: t('Appeal'),
      width: 130,
      renderCell: button,
    },
  ];

  const isEmpty = data.length === 0;

  const [time, setTime] = useState(DateTime.now().startOf('month'));

  const title = `${time.monthLong} ${time.year}`;

  const hasNext = time.hasSame(DateTime.now().startOf('month'), 'month');

  const setPrevMonth = () => {
    setTime(time.minus({ months: 1 }));
  };

  const setNextMonth = () => {
    setTime(time.plus({ months: 1 }));
  };

  const totalDonations = data.reduce((total, current) => {
    return total + current.convertedAmount;
  }, 0);

  const totals = data.reduce(
    (
      acc: {
        [key: string]: { convertedTotal: number; foreignTotal: number };
      },
      donation,
    ) => {
      const { foreignCurrency, foreignAmount, convertedAmount } = donation;
      if (acc[foreignCurrency] !== undefined) {
        acc[foreignCurrency].foreignTotal += foreignAmount;
        acc[foreignCurrency].convertedTotal += convertedAmount;
      } else {
        acc[foreignCurrency] = {
          convertedTotal: donation.convertedAmount,
          foreignTotal: donation.foreignAmount,
        };
      }
      return acc;
    },
    {},
  );

  return (
    <>
      <Box style={{ display: 'flex', margin: 8 }}>
        <Typography variant="h6">{title}</Typography>
        <Button
          style={{ marginLeft: 'auto' }}
          variant="contained"
          startIcon={<ChevronLeftIcon />}
          size="small"
          onClick={() => setPrevMonth()}
        >
          {t('Previous Month')}
        </Button>
        <Button
          variant="contained"
          endIcon={<ChevronRightIcon />}
          size="small"
          onClick={() => setNextMonth()}
          disabled={hasNext}
        >
          {t('Next Month')}
        </Button>
      </Box>
      <Divider style={{ margin: 12 }} variant="middle"></Divider>
      {!isEmpty ? (
        <DataTable>
          <DataGrid
            rows={data}
            columns={columns}
            autoPageSize
            autoHeight
            disableSelectionOnClick
            hideFooter
          />
          <Table>
            {Object.entries(totals).map(([currency, total]) => (
              <TableRow data-testid="donationRow" key={currency}>
                <TableCell style={{ width: 375 }}>
                  <Typography style={{ float: 'right', fontWeight: 'bold' }}>
                    {t('Total {{currency}} Donations:', { currency })}
                  </Typography>
                </TableCell>
                <TableCell style={{ width: 160 }}>
                  <Typography style={{ float: 'left', fontWeight: 'bold' }}>
                    {total.convertedTotal} {accountCurrency}
                  </Typography>
                </TableCell>
                <TableCell style={{}}>
                  <Typography style={{ float: 'left', fontWeight: 'bold' }}>
                    {total.foreignTotal} {currency}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Typography style={{ float: 'right', fontWeight: 'bold' }}>
                  {t('Total Donations: ')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography style={{ float: 'left', fontWeight: 'bold' }}>
                  {totalDonations}
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </Table>
        </DataTable>
      ) : (
        <EmptyDonationsTable
          title={t('No donations received in {{month}} {{year}}', {
            month: time.monthLong,
            year: time.year,
          })}
        />
      )}
    </>
  );
};
