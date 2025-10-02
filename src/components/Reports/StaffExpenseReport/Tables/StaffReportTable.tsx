import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, Tooltip, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { TableType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../StaffExpenseReport';

type RenderCell = GridColDef<StaffReportRow>['renderCell'];

export interface StaffReportTableProps {
  transactions: Transaction[];
  tableType: TableType;
  transferTotal: number;
  emptyPlaceholder: React.ReactElement;
  loading?: boolean;
}

const StyledGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-row:nth-of-type(2n + 1):not(:hover)': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
  '.MuiDataGrid-cell': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
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

export interface StaffReportRow {
  id: string;
  date: DateTime;
  description: string;
  amount: number;
}

export const createStaffReportRow = (
  transaction: Transaction,
  index: number,
): StaffReportRow => ({
  id: index.toString(),
  date: DateTime.fromISO(transaction.month),
  description: transaction.displayCategory,
  amount: transaction.total,
});

export const StaffReportTable: React.FC<StaffReportTableProps> = ({
  transactions,
  tableType,
  transferTotal,
  emptyPlaceholder,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const staffReportRows = useMemo(() => {
    return transactions.map((data, index) => createStaffReportRow(data, index));
  }, [transactions]);

  const date: RenderCell = ({ row }) => {
    return dateFormat(row.date, locale);
  };

  const description: RenderCell = ({ row }) => (
    <Tooltip title={t(row.description)}>
      <Typography variant="body2" noWrap>
        {row.description}
      </Typography>
    </Tooltip>
  );

  const amount: RenderCell = ({ row }) => {
    const isExpense = tableType === TableType.Expenses && row.amount < 0;
    const isIncome = tableType === TableType.Income && row.amount > 0;

    if (!isExpense && !isIncome) {
      return null;
    }

    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(row.amount, 'USD', locale)}
      </Typography>
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('Date'),
      width: 150,
      renderCell: date,
    },
    {
      field: 'description',
      headerName: t('Description'),
      flex: 1,
      renderCell: description,
    },
    {
      field: 'amount',
      headerName: t('Amount'),
      width: 150,
      renderCell: amount,
    },
  ];

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ]);

  return loading ? (
    <LoadingBox>
      <LoadingIndicator
        data-testid="loading-spinner"
        color="primary"
        size={50}
      />
    </LoadingBox>
  ) : transactions.length ? (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        mb={1}
      >
        {tableType === TableType.Income ? (
          <Typography variant="h6" mb={1}>
            {t('Income')}
          </Typography>
        ) : (
          <Typography variant="h6" mb={1}>
            {t('Expenses')}
          </Typography>
        )}
      </Box>
      <StyledGrid
        rows={staffReportRows || []}
        columns={columns}
        getRowId={(row) => `${row.date}-${row.description}`}
        sortingOrder={['desc', 'asc']}
        sortModel={sortModel}
        onSortModelChange={(size) => setSortModel(size)}
        pageSizeOptions={[
          5,
          10,
          25,
          { label: 'All', value: staffReportRows.length },
        ]}
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => setPaginationModel(model)}
        disableRowSelectionOnClick
        pagination
        disableColumnMenu
      />
      <Box display="flex" justifyContent="flex-end" mt={2} mb={2} mr={8.5}>
        {tableType === TableType.Income ? (
          <Typography fontWeight="bold">
            {t('Total Income:')}{' '}
            <span style={{ color: theme.palette.success.main }}>
              {currencyFormat(transferTotal, 'USD', locale)}
            </span>
          </Typography>
        ) : (
          <Typography fontWeight="bold">
            {t('Total Expenses:')}{' '}
            <span style={{ color: theme.palette.error.main }}>
              {currencyFormat(transferTotal, 'USD', locale)}
            </span>
          </Typography>
        )}
      </Box>
    </>
  ) : (
    emptyPlaceholder
  );
};

export default StaffReportTable;
