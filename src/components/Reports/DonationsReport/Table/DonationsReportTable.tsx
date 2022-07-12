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
  CircularProgress,
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef, GridCellParams } from '@material-ui/data-grid';
import { DateTime } from 'luxon';
import { EmptyDonationsTable } from '../../../common/EmptyDonationsTable/EmptyDonationsTable';
import {
  useGetDonationsTableQuery,
  ExpectedDonationDataFragment,
} from '../GetDonationsTable.generated';

interface Props {
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

const LoadingBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  margin: 'auto',
  padding: 4,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface Donation {
  date: Date;
  partnerId: string;
  partner: string;
  currency: string;
  foreignCurrency: string;
  convertedAmount: number;
  foreignAmount: number;
  designation: string;
  method: string | null;
  id: string;
}

export const DonationsReportTable: React.FC<Props> = ({ accountListId }) => {
  const { t } = useTranslation();

  const [time, setTime] = useState(DateTime.now().startOf('month'));

  const startDate = time.toString();

  const endDate = time.plus({ months: 1 }).toString();

  const { data, loading } = useGetDonationsTableQuery({
    variables: { accountListId, startDate, endDate },
  });

  const nodes = data?.donations.nodes || [];

  const accountCurrency = nodes[0]?.amount?.currency || 'USD';

  const createData = (data: ExpectedDonationDataFragment): Donation => {
    return {
      date: new Date(data.donationDate),
      partnerId: data.donorAccount.id,
      partner: data.donorAccount.displayName,
      currency: data.amount.convertedCurrency,
      foreignCurrency: data.amount.currency,
      convertedAmount: data.amount.convertedAmount,
      foreignAmount: data.amount.amount,
      designation: `${data.designationAccount.name} (${data.designationAccount.accountNumber})`,
      method: data.paymentMethod || null,
      id: data.id,
    };
  };

  const donations = nodes.map(createData);

  const link = (params: GridCellParams) => {
    const donation = params.row as Donation;

    return (
      <Typography>
        <Link href={`../../${accountListId}/contacts/${donation.partnerId}`}>
          {donation.partner}
        </Link>
      </Typography>
    );
  };

  const amount = (params: GridCellParams) => {
    const donation = params.row as Donation;

    return (
      <Typography>
        {`${Math.round(donation.convertedAmount * 100) / 100} ${
          donation.currency
        }`}
      </Typography>
    );
  };

  const designation = (params: GridCellParams) => {
    const donation = params.row as Donation;
    return <Typography>{donation.designation}</Typography>;
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
      width: 176,
    },
    {
      field: 'partner',
      headerName: t('Partner'),
      width: 296,
      renderCell: link,
    },
    {
      field: 'convertedAmount',
      headerName: t('Amount'),
      width: 186,
      renderCell: amount,
    },
    {
      field: 'designation',
      headerName: t('Designation'),
      width: 256,
      renderCell: designation,
    },
    {
      field: 'method',
      headerName: t('Method'),
      width: 191,
    },
    {
      field: 'appeal',
      headerName: t('Appeal'),
      width: 125,
      renderCell: button,
    },
  ];

  const isEmpty = nodes?.length === 0;

  const title = `${time.monthLong} ${time.year}`;

  const hasNext = time.hasSame(DateTime.now().startOf('month'), 'month');

  const setPrevMonth = () => {
    setTime(time.minus({ months: 1 }));
  };

  const setNextMonth = () => {
    setTime(time.plus({ months: 1 }));
  };

  const totalDonations = donations.reduce((total, current) => {
    return total + current.convertedAmount;
  }, 0);

  const totalForeignDonations = donations.reduce(
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
          convertedTotal: convertedAmount,
          foreignTotal: foreignAmount,
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
          style={{ marginLeft: 'auto', maxHeight: 35 }}
          variant="contained"
          startIcon={<ChevronLeftIcon />}
          size="small"
          onClick={() => setPrevMonth()}
        >
          {t('Previous Month')}
        </Button>
        <Button
          style={{ maxHeight: 35 }}
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
            rows={donations}
            columns={columns}
            autoPageSize
            autoHeight
            disableSelectionOnClick
            hideFooter
          />
          <Table>
            {Object.entries(totalForeignDonations).map(([currency, total]) => (
              <TableRow data-testid="donationRow" key={currency}>
                <TableCell style={{ width: 395 }}>
                  <Typography style={{ float: 'right', fontWeight: 'bold' }}>
                    {t('Total {{currency}} Donations:', { currency })}
                  </Typography>
                </TableCell>
                <TableCell style={{ width: 150 }}>
                  <Typography style={{ float: 'left', fontWeight: 'bold' }}>
                    {Math.round(total.convertedTotal * 100) / 100}{' '}
                    {accountCurrency}
                  </Typography>
                </TableCell>
                <TableCell style={{}}>
                  <Typography style={{ float: 'left', fontWeight: 'bold' }}>
                    {Math.round(total.foreignTotal * 100) / 100} {currency}
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
                  {Math.round(totalDonations * 100) / 100}
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </Table>
        </DataTable>
      ) : loading ? (
        <LoadingBox>
          <LoadingIndicator color="primary" size={50} />
        </LoadingBox>
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
