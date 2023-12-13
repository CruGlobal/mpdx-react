import React, { useMemo, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
 Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { EditDonationModal } from 'src/components/EditDonationModal/EditDonationModal';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat/intlFormat';
import { EmptyDonationsTable } from '../../../common/EmptyDonationsTable/EmptyDonationsTable';
import {
  DonationTableRowFragment,
  GetDonationsTableQueryVariables,
  useGetAccountListCurrencyQuery,
  useGetDonationsTableQuery,
} from '../GetDonationsTable.generated';

type RenderCell = GridColDef<DonationRow>['renderCell'];

interface DonationReportTableProps {
  accountListId: string;
  designationAccounts?: string[];
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

interface DonationRow {
  id: string;
  date: DateTime;
  contactId: string | null;
  donorAccountName: string;
  currency: string;
  foreignCurrency: string;
  convertedAmount: number;
  foreignAmount: number;
  designationAccount: string;
  paymentMethod: string | null;
  appealName: string | null;
  rawDonation: DonationTableRowFragment;
}

const createDonationRow = (data: DonationTableRowFragment): DonationRow => ({
  id: data.id,
  date: DateTime.fromISO(data.donationDate),
  contactId: data.donorAccount.contacts.nodes[0]?.id ?? null,
  donorAccountName: data.donorAccount.displayName,
  convertedAmount: data.amount.convertedAmount,
  currency: data.amount.convertedCurrency,
  foreignAmount: data.amount.amount,
  foreignCurrency: data.amount.currency,
  designationAccount: data.designationAccount.name,
  paymentMethod: data.paymentMethod ?? null,
  appealName: data.appeal?.name ?? null,
  rawDonation: data,
});

export const DonationsReportTable: React.FC<DonationReportTableProps> = ({
  accountListId,
  designationAccounts,
  onSelectContact,
  time,
  setTime,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [selectedDonation, setSelectedDonation] = useState<DonationRow | null>(
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
  const variables: GetDonationsTableQueryVariables = useMemo(
    () => ({
      accountListId,
      pageSize,
      startDate,
      endDate,
      designationAccountIds: designationAccounts?.length
        ? designationAccounts
        : null,
    }),
    [accountListId, startDate, endDate, designationAccounts],
  );
  const { data, error, loading, fetchMore } = useGetDonationsTableQuery({
    variables,
  });
  // Load the rest of the pages asynchronously so that we can calculate the total donations
  useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.donations.pageInfo,
  });

  const { data: accountListData, loading: loadingAccountListData } =
    useGetAccountListCurrencyQuery({
      variables: { accountListId },
    });

  const nodes = data?.donations.nodes || [];

  const accountCurrency = accountListData?.accountList.currency || 'USD';

  const donations = useMemo(() => nodes.map(createDonationRow), [nodes]);

  const date: RenderCell = ({ row }) => (
    <Typography>{dateFormatShort(row.date, locale)}</Typography>
  );

  const link: RenderCell = ({ row }) => (
    <Typography sx={{ cursor: 'pointer' }}>
      <Link
        underline="hover"
        onClick={() => row.contactId && onSelectContact(row.contactId)}
      >
        {row.donorAccountName}
      </Link>
    </Typography>
  );

  const amount: RenderCell = ({ row }) => (
    <Typography>
      {currencyFormat(row.convertedAmount, row.currency, locale)}
    </Typography>
  );

  const foreignAmount: RenderCell = ({ row }) => (
    <Typography>
      {currencyFormat(row.foreignAmount, row.foreignCurrency, locale)}
    </Typography>
  );

  const designation: RenderCell = ({ row }) => (
    <Typography>{row.designationAccount}</Typography>
  );

  const method: RenderCell = ({ row: donation }) => (
    <Typography>{donation.paymentMethod}</Typography>
  );

  const button: RenderCell = ({ row: donation }) => {
    return (
      <Box
        width={'100%'}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography data-testid="appeal-name">{donation.appealName}</Typography>
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
      width: 100,
      renderCell: date,
    },
    {
      field: 'donorAccountName',
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
      renderCell: method,
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

  const title = time.toJSDate().toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

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
                          {currencyFormat(
                            total.convertedTotal,
                            accountCurrency,
                            locale,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell style={{}}>
                        <Typography
                          style={{ float: 'left', fontWeight: 'bold' }}
                        >
                          {currencyFormat(total.foreignTotal, currency, locale)}
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
                      {currencyFormat(totalDonations, accountCurrency, locale)}
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
          donation={selectedDonation.rawDonation}
          handleClose={() => handleClose()}
        />
      )}
    </>
  );
};
