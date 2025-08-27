import React, { useEffect, useMemo } from 'react';
import {
  Box,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  DonationRow,
  LoadingProgressBar,
  StyledGrid,
  createDonationRow,
} from 'src/components/DonationTable/DonationTable';
import {
  DonationTableQueryVariables,
  useDonationTableQuery,
} from 'src/components/DonationTable/DonationTable.generated';
import { LoadingIndicator } from 'src/components/Shared/styledComponents/LoadingIndicator';
import {
  LoadingBox,
  StyledCheckbox,
} from 'src/components/Shared/styledComponents/styledComponents';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';

type RenderCell = GridColDef<DonationRow>['renderCell'];

export interface DonationTableProps {
  appealId: string;
  filter: Partial<DonationTableQueryVariables>;
  loading?: boolean;
  onSelectContact?: (contactId: string) => void;
  visibleColumnsStorageKey: string;
  emptyPlaceholder: React.ReactElement;
  accountCurrency: string;
  selectedDonations: DonationRow[];
  setSelectedDonations: React.Dispatch<React.SetStateAction<DonationRow[]>>;
  totalSelectedDonationsAmount: number;
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  donationTableQueryResult: ReturnType<typeof useDonationTableQuery>;
}

const TotalsTable = styled(Table)({
  '.MuiTableCell-root': {
    fontWeight: 'bold',
  },

  '.MuiTableRow-root .MuiTableCell-root': {
    textAlign: 'right',
  },
});

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  minWidth: '40px',
}));

export const DonationTable: React.FC<DonationTableProps> = ({
  appealId,
  filter,
  loading: skipped = false,
  visibleColumnsStorageKey,
  emptyPlaceholder,
  accountCurrency,
  selectedDonations = [],
  setSelectedDonations,
  totalSelectedDonationsAmount = 0,
  paginationModel,
  setPaginationModel,
  donationTableQueryResult,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data, error, loading, fetchMore } = donationTableQueryResult;
  const preselectedDonations = useMemo(
    () =>
      data?.donations.nodes
        .filter((donation) => donation.appeal?.id === appealId)
        .map((donation) => createDonationRow(donation, false)) ?? [],
    [data],
  );

  // Load the rest of the pages asynchronously so that we can calculate the total donations
  useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.donations.pageInfo,
  });

  useEffect(() => {
    if (preselectedDonations?.length) {
      setSelectedDonations(preselectedDonations);
    }
  }, [preselectedDonations]);

  const nodes = data?.donations.nodes || [];

  const donations = useMemo(
    () => nodes.map((node) => createDonationRow(node, false)),
    [nodes],
  );

  const isPreselectedDonation = (donation: DonationRow) =>
    preselectedDonations.some((donationRow) => donationRow.id === donation.id);
  const isDonationChecked = (donation: DonationRow) =>
    selectedDonations.some((donationRow) => donationRow.id === donation.id);

  const date: RenderCell = ({ row }) => dateFormatShort(row.date, locale);

  const amount: RenderCell = ({ row }) =>
    currencyFormat(row.convertedAmount, row.currency, locale);

  const foreignAmount: RenderCell = ({ row }) =>
    currencyFormat(row.foreignAmount, row.foreignCurrency, locale);

  const designationAccount: RenderCell = ({ row }) => (
    <Tooltip title={row.designationAccount}>
      <span>{row.designationAccount}</span>
    </Tooltip>
  );

  const appeal: RenderCell = ({ row: donation }) => (
    <span
      style={{
        textDecoration:
          isPreselectedDonation(donation) && !isDonationChecked(donation)
            ? 'line-through'
            : undefined,
      }}
    >
      {donation.appealName}
    </span>
  );

  const onDonationCheckToggle = (donation: DonationRow) => {
    if (!setSelectedDonations) {
      return;
    }
    const isSelected = selectedDonations.some(
      (donationRow) => donationRow.id === donation.id,
    );

    if (isSelected) {
      const removeDonation = selectedDonations.filter(
        (donationRow) => donationRow.id !== donation.id,
      );
      setSelectedDonations(removeDonation);
    } else {
      setSelectedDonations([...selectedDonations, donation]);
    }
  };

  const select: RenderCell = ({ row: donation }) => (
    <StyledListItemIcon>
      <StyledCheckbox
        checked={isDonationChecked(donation)}
        color="secondary"
        onClick={(event) => event.stopPropagation()}
        onChange={() => onDonationCheckToggle(donation)}
      />
    </StyledListItemIcon>
  );

  const columns: GridColDef[] = [
    {
      field: 'Select',
      headerName: t('Select'),
      width: 40,
      renderCell: select,
      hideable: false,
    },
    {
      field: 'date',
      headerName: t('Date'),
      flex: 1,
      minWidth: 80,
      renderCell: date,
    },
    {
      field: 'designationAccount',
      headerName: t('Designation'),
      flex: 3,
      minWidth: 200,
      renderCell: designationAccount,
    },
    {
      field: 'appealName',
      headerName: t('Appeal'),
      flex: 1,
      minWidth: 100,
      renderCell: appeal,
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
      field: 'convertedAmount',
      headerName: t('Amount'),
      flex: 1,
      minWidth: 120,
      renderCell: amount,
      align: 'right',
    },
  ];

  const hasForeignDonations = donations.some(
    (donation) => donation.foreignCurrency !== accountCurrency,
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

  return data?.donations.nodes.length ? (
    <>
      <StyledGrid
        // If we use paginationMode="client", the data grid won't show the total row count in
        // the pagination UI because it assumes that the provided rows are all the rows.
        // If we use paginationMode="server" and pass in all the rows, the data grid won't
        // automatically limit the rows to the selected page because it assumes that the
        // provided rows are all the rows for that page.
        // To work around this, we have to use paginationMode="server" and manually pass in only
        // the current page's rows.
        rows={donations.slice(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize,
        )}
        rowCount={data?.donations.totalCount}
        paginationMode="server"
        columns={columns}
        columnVisibilityModel={{
          ...columnVisibility,
          foreignAmount: hasForeignDonations,
        }}
        onColumnVisibilityModelChange={setColumnVisibility}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        autoHeight
        disableRowSelectionOnClick
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
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: 450, paddingRight: 2 }}>
                {t('Total Donations: ')}
                {currencyFormat(
                  totalSelectedDonationsAmount,
                  accountCurrency,
                  locale,
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </TotalsTable>
      )}
    </>
  ) : loading || skipped ? (
    <LoadingBox>
      <LoadingIndicator data-testid="LoadingBox" color="primary" size={50} />
    </LoadingBox>
  ) : (
    emptyPlaceholder
  );
};
