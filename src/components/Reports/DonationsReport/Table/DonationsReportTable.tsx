import React, { useMemo, useState } from 'react';
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
  TableHead,
  TableBody,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridSortModel,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { EmptyDonationsTable } from '../../../common/EmptyDonationsTable/EmptyDonationsTable';
import {
  useGetDonationsTableQuery,
  ExpectedDonationDataFragment,
  useGetAccountListCurrencyQuery,
} from '../GetDonationsTable.generated';
import { EditDonationModal } from './Modal/EditDonationModal';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';

interface Props {
  accountListId: string;
  onSelectContact: (contactId: string) => void;
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

const LoadingProgressBar = styled(LinearProgress)(({ theme }) => ({
  flex: 0.25,
  height: '0.5rem',
  borderRadius: theme.shape.borderRadius,
  ['& .MuiLinearProgress-bar']: {
    borderRadius: theme.shape.borderRadius,
  },
  alignSelf: 'center',
}));

export interface Donation {
  date: Date;
  contactId: string | null;
  partnerId: string;
  partner: string;
  currency: string;
  foreignCurrency: string;
  convertedAmount: number;
  foreignAmount: number;
  designationAccount: { id: string; name: string };
  method: string | null;
  id: string;
  appeal: ExpectedDonationDataFragment['appeal'];
  appealAmount: number | null;
}

export const DonationsReportTable: React.FC<Props> = ({
  accountListId,
  onSelectContact,
  time,
  setTime,
}) => {
  const { t } = useTranslation();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null,
  );

  const handleClose = () => {
    setSelectedDonation(null);
  };

  const startDate = time.toString().slice(0, 10);
  const endDate = time
    .plus({ months: 1 })
    .minus({ days: 1 })
    .toString()
    .slice(0, 10);

  const [pageSize, setPageSize] = useState(25);

  // pageSize is intentionally omitted from the dependencies array so that the query isn't rerun when the page size changes
  // If all the pages have loaded and the user changes the page size, there's no reason to reload all the pages
  // TODO: sort donations on the server after https://jira.cru.org/browse/MPDX-7634 is implemented
  const variables = useMemo(
    () => ({ accountListId, pageSize, startDate, endDate }),
    [accountListId, startDate, endDate],
  );
  const { data, loading, fetchMore } = useGetDonationsTableQuery({
    variables,

    // When they user comes back to a month that they have loaded before, use the cached data because it will have all
    // the pages of data instead of just the first one if we load from the network
    fetchPolicy: 'cache-first',
  });
  // Load the rest of the pages asynchronously so that we can calculate the total donations
  useFetchAllPages({
    fetchMore,
    pageInfo: data?.donations.pageInfo,
  });

  const { data: accountListData, loading: loadingAccountListData } =
    useGetAccountListCurrencyQuery({
      variables: { accountListId },
    });

  const nodes = data?.donations.nodes || [];

  const accountCurrency = accountListData?.accountList.currency || 'USD';

  const createData = (data: ExpectedDonationDataFragment): Donation => {
    return {
      date: new Date(`${data.donationDate}T00:00:00`),
      contactId: data.donorAccount.contacts.nodes[0]?.id ?? null,
      partnerId: data.donorAccount.id,
      partner: data.donorAccount.displayName,
      currency: data.amount.convertedCurrency,
      foreignCurrency: data.amount.currency,
      convertedAmount: data.amount.convertedAmount,
      foreignAmount: data.amount.amount,
      designationAccount: {
        id: data.designationAccount.id,
        name: data.designationAccount.name,
      },
      method: data.paymentMethod || null,
      id: data.id,
      appeal: data.appeal,
      appealAmount: (data.appeal && data.appealAmount?.amount) ?? null,
    };
  };

  const donations = useMemo(() => nodes.map(createData), [nodes]);

  const link = (params: GridCellParams) => {
    const donation = params.row as Donation;

    return (
      <Typography sx={{ cursor: 'pointer' }}>
        <Link
          onClick={() =>
            donation.contactId && onSelectContact(donation.contactId)
          }
        >
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
    return <Typography>{donation.designationAccount?.name}</Typography>;
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
        <IconButton
          color="primary"
          onClick={() => {
            setSelectedDonation(donation);
          }}
        >
          <EditIcon data-testid={`edit-${donation.id}`} />
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

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ]);

  // Remove foreign amount column if both of these conditions are met:
  // 1.) There only one type of currency.
  // 2.) The type of currency is the same as the account currency.
  const currencyList = new Set(
    donations.map((donation) => donation.foreignCurrency),
  );

  if (currencyList.size === 1 && currencyList.has(accountCurrency)) {
    columns.splice(3, 1);
    columns.forEach(
      (column) => (column.width = column.width ? column.width + 20 : 0),
    );
  }

  const isEmpty = nodes.length === 0;

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
      acc: Record<string, { convertedTotal: number; foreignTotal: number }>,
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

  const loadingProgress = data
    ? (data.donations.nodes.length / (data?.donations.totalCount || 1)) * 100
    : 0;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          margin: 1,
          gap: 2,
        }}
      >
        <Typography variant="h6">{title}</Typography>
        {data?.donations.pageInfo.hasNextPage && (
          <LoadingProgressBar
            data-testid="nextPageProcessBar"
            variant="determinate"
            value={loadingProgress}
          />
        )}
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
            rowCount={data?.donations.totalCount}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(pageSize) => setPageSize(pageSize)}
            rowsPerPageOptions={[25, 50, 100]}
            pagination
            sortModel={sortModel}
            onSortModelChange={(sortModel) => setSortModel(sortModel)}
            autoHeight
            disableSelectionOnClick
            disableVirtualization
          />
          {!data?.donations.pageInfo.hasNextPage && (
            <Table>
              <TableHead>
                {Object.entries(totalForeignDonations).map(
                  ([currency, total]) => (
                    <TableRow data-testid="donationRow" key={currency}>
                      <TableCell style={{ width: 395 }}>
                        <Typography
                          style={{ float: 'right', fontWeight: 'bold' }}
                        >
                          {t('Total {{currency}} Donations:', { currency })}
                        </Typography>
                      </TableCell>
                      <TableCell style={{ width: 150 }}>
                        <Typography
                          style={{ float: 'left', fontWeight: 'bold' }}
                        >
                          {Math.round(total.convertedTotal * 100) / 100}{' '}
                          {accountCurrency}
                        </Typography>
                      </TableCell>
                      <TableCell style={{}}>
                        <Typography
                          style={{ float: 'left', fontWeight: 'bold' }}
                        >
                          {Math.round(total.foreignTotal * 100) / 100}{' '}
                          {currency}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableHead>
              <TableBody>
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
              </TableBody>
            </Table>
          )}
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
      {selectedDonation && (
        <EditDonationModal
          open
          donation={selectedDonation}
          handleClose={() => handleClose()}
        />
      )}
    </>
  );
};
