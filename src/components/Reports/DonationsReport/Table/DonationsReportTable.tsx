import { Appeal } from '../../../../../graphql/types.generated';
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Link,
  Divider,
  Table,
  TableCell,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { EmptyDonationsTable } from '../../../common/EmptyDonationsTable/EmptyDonationsTable';
import {
  useGetDonationsTableQuery,
  ExpectedDonationDataFragment,
  useGetAccountListCurrencyQuery,
} from '../GetDonationsTable.generated';

interface Props {
  accountListId: string;
  time: DateTime;
  setTime: (time: DateTime) => void;
}

const DataTable = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& .MuiDataGrid-row.Mui-even:not(:hover)': {
    backgroundColor:
      theme.palette.mode === 'light'
        ? theme.palette.common.white
        : theme.palette.cruGrayLight.main,
  },
  '& .MuiDataGrid-cell': {
    '& .MuiTypography-root': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
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
  designation: string | undefined | null;
  method: string | null;
  id: string;
  appeal: Partial<Appeal> | undefined | null;
}

export const DonationsReportTable: React.FC<Props> = ({
  accountListId,
  time,
  setTime,
}) => {
  const { t } = useTranslation();

  const startDate = time.toString();

  const endDate = time.plus({ months: 1 }).toString();

  const { data, loading } = useGetDonationsTableQuery({
    variables: { accountListId, startDate, endDate },
  });

  const { data: accountListData, loading: loadingAccountListData } =
    useGetAccountListCurrencyQuery({
      variables: { accountListId },
    });

  const nodes = data?.donations.nodes || [];
  const designationNames = data?.getDesignationDisplayNames || [];

  const accountCurrency = accountListData?.accountList.currency || 'USD';

  const createData = (data: ExpectedDonationDataFragment): Donation => {
    return {
      date: new Date(data.donationDate),
      partnerId: data.donorAccount.id,
      partner: data.donorAccount.displayName,
      currency: data.amount.convertedCurrency,
      foreignCurrency: data.amount.currency,
      convertedAmount: data.amount.convertedAmount,
      foreignAmount: data.amount.amount,
      designation: designationNames.find(
        (designation) => designation?.id === data.id,
      )?.displayName,
      method: data.paymentMethod || null,
      id: data.id,
      appeal: data.appeal,
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

  const foreignAmount = (params: GridCellParams) => {
    const donation = params.row as Donation;
    return (
      <Typography>
        {`${Math.round(donation.foreignAmount * 100) / 100} ${
          donation.foreignCurrency
        }`}
      </Typography>
    );
  };

  const designation = (params: GridCellParams) => {
    const donation = params.row as Donation;
    return <Typography>{donation.designation}</Typography>;
  };

  const button = (params: GridCellParams) => {
    const donation = params.row as Donation;
    return (
      <Box
        width={'100%'}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography data-testid="appeal-name">
          {donation.appeal?.name}
        </Typography>
        <IconButton color="primary">
          <EditIcon />
        </IconButton>
      </Box>
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('Date'),
      type: 'date',
      width: 100,
    },
    {
      field: 'partner',
      headerName: t('Partner'),
      width: 360,
      renderCell: link,
    },
    {
      field: 'convertedAmount',
      headerName: t('Amount'),
      width: 120,
      renderCell: amount,
    },
    {
      field: 'foreignAmount',
      headerName: t('Foreign Amount'),
      width: 120,
      renderCell: foreignAmount,
    },
    {
      field: 'designation',
      headerName: t('Designation'),
      width: 220,
      renderCell: designation,
    },
    {
      field: 'method',
      headerName: t('Method'),
      width: 100,
    },
    {
      field: 'appeal',
      headerName: t('Appeal'),
      width: 125,
      renderCell: button,
    },
  ];

  // Remove foreign amount column if both of these conditions are met:
  // 1.) There only one type of currency.
  // 2.) The type of currency is the same as the account currency.
  const currencyList = [
    ...new Set(donations.map((donation) => donation.foreignCurrency)),
  ];

  if (currencyList.length === 1 && currencyList.includes(accountCurrency)) {
    columns.splice(3, 1);
    columns.forEach(
      (column) => (column.width = column.width ? column.width + 20 : 0),
    );
  }

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
            autoHeight
            disableSelectionOnClick
            hideFooter
            disableVirtualization
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
      ) : loading || loadingAccountListData ? (
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
