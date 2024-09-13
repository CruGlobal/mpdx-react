import React, { useMemo, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import {
  DynamicEditDonationModal,
  preloadEditDonationModal,
} from '../EditDonationModal/DynamicEditDonationModal';
import {
  DonationTableQueryVariables,
  DonationTableRowFragment,
  useAccountListCurrencyQuery,
  useDonationTableQuery,
} from './DonationTable.generated';

type RenderCell = GridColDef<DonationRow>['renderCell'];

export interface DonationTableProps {
  accountListId: string;
  filter: Partial<DonationTableQueryVariables>;
  loading?: boolean;
  onSelectContact?: (contactId: string) => void;
  visibleColumnsStorageKey: string;
  emptyPlaceholder: React.ReactElement;
}

export const StyledGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-row:nth-of-type(2n + 1):not(:hover)': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
  '.MuiDataGrid-cell': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

const TotalsTable = styled(Table)({
  '.MuiTableCell-root': {
    fontWeight: 'bold',
  },

  '.MuiTableRow-root .MuiTableCell-root:nth-of-type(1)': {
    textAlign: 'right',
  },
});

export const LoadingProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: '0.5rem',
  borderRadius: theme.shape.borderRadius,
  ['& .MuiLinearProgress-bar']: {
    borderRadius: theme.shape.borderRadius,
  },
}));

export const LoadingBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  margin: 'auto',
  padding: 4,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

export interface DonationRow {
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

export const createDonationRow = (
  data: DonationTableRowFragment,
): DonationRow => ({
  id: data.id,
  date: DateTime.fromISO(data.donationDate),
  contactId: data.donorAccount.contacts.nodes[0]?.id ?? null,
  donorAccountName: data.donorAccount.displayName,
  convertedAmount: data.amount.convertedAmount,
  currency: data.amount.convertedCurrency,
  foreignAmount: data.amount.amount,
  foreignCurrency: data.amount.currency,
  designationAccount: data.designationAccount.name
    ? data.designationAccount.name
    : data.designationAccount.accountNumber,
  paymentMethod: data.paymentMethod ?? null,
  appealName: data.appeal?.name ?? null,
  rawDonation: data,
});

export const DonationTable: React.FC<DonationTableProps> = ({
  accountListId,
  filter,
  loading: skipped = false,
  onSelectContact,
  visibleColumnsStorageKey,
  emptyPlaceholder,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [editingDonation, setEditingDonation] = useState<DonationRow | null>(
    null,
  );

  const handleClose = () => {
    setEditingDonation(null);
  };

  const [pageSize, setPageSize] = useState(25);

  // pageSize is intentionally omitted from the dependencies array so that the query isn't rerun when the page size changes
  // If all the pages have loaded and the user changes the page size, there's no reason to reload all the pages
  // TODO: sort donations on the server after https://jira.cru.org/browse/MPDX-7634 is implemented
  const variables: DonationTableQueryVariables = useMemo(
    () => ({
      accountListId,
      pageSize,
      ...filter,
    }),
    [accountListId, filter],
  );
  const { data, error, loading, fetchMore } = useDonationTableQuery({
    variables,
    skip: skipped,
  });
  // Load the rest of the pages asynchronously so that we can calculate the total donations
  useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.donations.pageInfo,
  });

  const { data: accountListData, loading: loadingAccountListData } =
    useAccountListCurrencyQuery({
      variables: { accountListId },
    });

  const nodes = data?.donations.nodes || [];

  const accountCurrency = accountListData?.accountList.currency || 'USD';

  const donations = useMemo(() => nodes.map(createDonationRow), [nodes]);

  const date: RenderCell = ({ row }) => dateFormatShort(row.date, locale);

  const donor: RenderCell = ({ row }) => (
    <Tooltip title={row.donorAccountName}>
      {onSelectContact ? (
        <Link
          underline="hover"
          onClick={() => row.contactId && onSelectContact(row.contactId)}
        >
          {row.donorAccountName}
        </Link>
      ) : (
        <span>{row.donorAccountName}</span>
      )}
    </Tooltip>
  );

  const amount: RenderCell = ({ row }) =>
    currencyFormat(row.convertedAmount, row.currency, locale);

  const foreignAmount: RenderCell = ({ row }) =>
    currencyFormat(row.foreignAmount, row.foreignCurrency, locale);

  const designationAccount: RenderCell = ({ row }) => (
    <Tooltip title={row.designationAccount}>
      <span>{row.designationAccount}</span>
    </Tooltip>
  );

  const appeal: RenderCell = ({ row: donation }) => donation.appealName;

  const edit: RenderCell = ({ row: donation }) => (
    <IconButton
      color="primary"
      onClick={() => {
        setEditingDonation(donation);
      }}
      onMouseEnter={preloadEditDonationModal}
    >
      <EditIcon data-testid={`edit-${donation.id}`} />
    </IconButton>
  );

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('Date'),
      flex: 1,
      minWidth: 80,
      renderCell: date,
    },
    {
      field: 'donorAccountName',
      headerName: t('Partner'),
      flex: 3,
      minWidth: 200,
      renderCell: donor,
    },
    {
      field: 'convertedAmount',
      headerName: t('Amount'),
      flex: 1,
      minWidth: 120,
      renderCell: amount,
    },
    {
      field: 'foreignAmount',
      headerName: t('Foreign Amount'),
      flex: 1.5,
      minWidth: 120,
      renderCell: foreignAmount,
      hideable: false,
    },
    {
      field: 'designationAccount',
      headerName: t('Designation'),
      flex: 3,
      minWidth: 200,
      renderCell: designationAccount,
    },
    {
      field: 'paymentMethod',
      headerName: t('Method'),
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'appealName',
      headerName: t('Appeal'),
      flex: 1,
      minWidth: 100,
      renderCell: appeal,
    },
    {
      field: 'Edit',
      headerName: t('Edit'),
      width: 40,
      renderCell: edit,
      hideable: false,
    },
  ];

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ]);

  const hasForeignDonations = donations.some(
    (donation) => donation.foreignCurrency !== accountCurrency,
  );

  const totalDonations = donations.reduce<number>(
    (total, current) => total + current.convertedAmount,
    0,
  );

  const totalForeignDonations = donations.reduce(
    (
      acc: Record<string, { convertedTotal: number; foreignTotal: number }>,
      donation,
    ) => {
      const { foreignCurrency, foreignAmount, convertedAmount } = donation;
      acc[foreignCurrency] = {
        convertedTotal:
          convertedAmount + (acc[foreignCurrency]?.convertedTotal ?? 0),
        foreignTotal:
          foreignAmount + (acc[foreignCurrency]?.convertedTotal ?? 0),
      };
      return acc;
    },
    {},
  );

  const loadedPercentage = data
    ? (data.donations.nodes.length / (data.donations.totalCount || 1)) * 100
    : 0;
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<GridColumnVisibilityModel>(
      `donation-table-visible-columns-${visibleColumnsStorageKey}`,
      {
        partner: typeof filter.donorAccountIds === 'undefined',
      },
    );

  return (
    <>
      {data?.donations.nodes.length ? (
        <>
          <StyledGrid
            rows={donations}
            rowCount={data?.donations.totalCount}
            columns={columns}
            columnVisibilityModel={{
              ...columnVisibility,
              foreignAmount: hasForeignDonations,
            }}
            onColumnVisibilityModelChange={setColumnVisibility}
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
          {data.donations.pageInfo.hasNextPage ? (
            <Box mx={8} my={2}>
              <LoadingProgressBar
                data-testid="nextPageProgressBar"
                variant="determinate"
                value={loadedPercentage}
              />
            </Box>
          ) : (
            <TotalsTable aria-label={t('Donation Totals')}>
              {hasForeignDonations && (
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>{t('Amount')}</TableCell>
                    <TableCell>{t('Foreign Amount')}</TableCell>
                  </TableRow>
                </TableHead>
              )}
              <TableBody>
                {hasForeignDonations &&
                  Object.entries(totalForeignDonations).map(
                    ([currency, total]) => (
                      <TableRow data-testid="donationRow" key={currency}>
                        <TableCell>
                          {t('Total {{currency}} Donations:', { currency })}
                        </TableCell>
                        <TableCell>
                          {currencyFormat(
                            total.convertedTotal,
                            accountCurrency,
                            locale,
                          )}
                        </TableCell>
                        <TableCell>
                          {currencyFormat(total.foreignTotal, currency, locale)}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                <TableRow>
                  {/* Best-effort attempt to line up the columns with the DataGrid when the column visibility isn't customized */}
                  <TableCell style={{ width: hasForeignDonations ? 385 : 450 }}>
                    {t('Total Donations: ')}
                  </TableCell>
                  <TableCell style={{ width: 100 }}>
                    {currencyFormat(totalDonations, accountCurrency, locale)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </TotalsTable>
          )}
        </>
      ) : loadingAccountListData || loading || skipped ? (
        <LoadingBox>
          <LoadingIndicator
            data-testid="LoadingBox"
            color="primary"
            size={50}
          />
        </LoadingBox>
      ) : (
        emptyPlaceholder
      )}
      {editingDonation && (
        <DynamicEditDonationModal
          open
          donation={editingDonation.rawDonation}
          handleClose={() => handleClose()}
        />
      )}
    </>
  );
};
