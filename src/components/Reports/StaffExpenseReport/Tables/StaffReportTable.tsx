import React, { useMemo, useState } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CategoryBreakdownDialog } from '../CategoryBreakdownDialog/CategoryBreakdownDialog';
import { ReportType } from '../Helpers/StaffReportEnum';
import { AggregationPeriod } from '../Helpers/aggregationPolicy';
import {
  GroupedTransaction,
  Transaction,
  isGroupedTransaction,
} from '../Helpers/filterTransactions';
import { formatAggregatedDate } from '../Helpers/formatDate';

const DEFAULT_PAGE_SIZE = 25;

type RenderCell = GridColDef<StaffReportRow>['renderCell'];

export interface StaffReportTableProps {
  transactions: (Transaction | GroupedTransaction)[];
  tableType: ReportType.Income | ReportType.Expense;
  transferTotal: number;
  emptyPlaceholder: React.ReactElement;
  loading?: boolean;
}

const StyledGrid = styled(DataGrid, {
  shouldForwardProp: (prop) => prop !== 'tableType',
})<{ tableType: ReportType.Income | ReportType.Expense }>(
  ({ theme, tableType }) => ({
    '.MuiDataGrid-row:nth-of-type(2n + 1):not(:hover)': {
      backgroundColor:
        tableType === ReportType.Expense
          ? theme.palette.chipRedLight.main
          : theme.palette.mpdxGrayLight.main,
    },
    '.MuiDataGrid-cell': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      display: 'flex',
      alignItems: 'center',
    },
  }),
);

const LoadingBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxGrayLight.main,
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
  isGrouped: boolean;
  period: AggregationPeriod;
  groupedTransaction?: GroupedTransaction;
}

export const createStaffReportRow = (
  transaction: Transaction | GroupedTransaction,
  index: number,
): StaffReportRow => {
  const isGrouped = isGroupedTransaction(transaction);
  return {
    id: index.toString(),
    date: DateTime.fromISO(transaction.transactedAt),
    // A rolled up row carries its bucket label; an itemized one shows what the transaction says.
    description: transaction.description || transaction.displayCategory,
    amount: transaction.amount,
    isGrouped,
    period: isGrouped ? transaction.period : AggregationPeriod.None,
    groupedTransaction: isGrouped ? transaction : undefined,
  };
};

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
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [breakdownDialog, setBreakdownDialog] = useState<{
    isOpen: boolean;
    categoryName: string;
    transactions: Transaction[];
    totalAmount: number;
  }>({
    isOpen: false,
    categoryName: '',
    transactions: [],
    totalAmount: 0,
  });

  const handleOpenBreakdown = (groupedTransaction: GroupedTransaction) => {
    setBreakdownDialog({
      isOpen: true,
      categoryName: groupedTransaction.displayCategory,
      transactions: groupedTransaction.groupedTransactions,
      totalAmount: groupedTransaction.amount,
    });
  };

  const handleCloseBreakdown = () => {
    setBreakdownDialog({
      isOpen: false,
      categoryName: '',
      transactions: [],
      totalAmount: 0,
    });
  };

  const staffReportRows = useMemo(() => {
    return transactions.map((data, index) => createStaffReportRow(data, index));
  }, [transactions]);

  const date: RenderCell = ({ row }) =>
    formatAggregatedDate(row.date, row.period, locale);

  const description: RenderCell = ({ row }) => (
    <Tooltip title={row.description}>
      <Typography variant="body2" noWrap>
        {row.description}
      </Typography>
    </Tooltip>
  );

  const amount: RenderCell = ({ row }) => {
    const displayAmount =
      tableType === ReportType.Expense ? Math.abs(row.amount) : row.amount;
    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(displayAmount, 'USD', locale)}
      </Typography>
    );
  };

  const tooltip: RenderCell = ({ row }) => {
    if (!row.isGrouped || !row.groupedTransaction) {
      return null;
    }
    const grouped = row.groupedTransaction;

    return (
      <Tooltip title={t('View breakdown')}>
        <IconButton
          size="small"
          onClick={() => handleOpenBreakdown(grouped)}
          aria-label={t('View breakdown')}
        >
          <InfoOutlined />
        </IconButton>
      </Tooltip>
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
      sortComparator: (amountA: number, amountB: number) =>
        tableType === ReportType.Expense
          ? Math.abs(amountA) - Math.abs(amountB)
          : amountA - amountB,
    },
    {
      field: 'tooltip',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: tooltip,
    },
  ];

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

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
        {tableType === ReportType.Income ? (
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
        tableType={tableType}
        rows={staffReportRows}
        columns={columns}
        getRowId={(row) => row.id}
        sortingOrder={['desc', 'asc', null]}
        sortModel={sortModel}
        onSortModelChange={(size) => setSortModel(size)}
        pageSizeOptions={[DEFAULT_PAGE_SIZE]}
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => setPaginationModel(model)}
        disableRowSelectionOnClick
        pagination
        disableColumnMenu
      />
      <Box display="flex" justifyContent="flex-end" mt={2} mb={2} mr={8.5}>
        {tableType === ReportType.Income ? (
          <Typography fontWeight="bold">
            {t('Total Income:')}{' '}
            <Typography
              component="span"
              sx={{ color: theme.palette.success.main }}
            >
              {currencyFormat(transferTotal, 'USD', locale)}
            </Typography>
          </Typography>
        ) : (
          <Typography fontWeight="bold">
            {t('Total Expenses:')}{' '}
            <Typography
              component="span"
              sx={{ color: theme.palette.error.main }}
            >
              {currencyFormat(Math.abs(transferTotal), 'USD', locale)}
            </Typography>
          </Typography>
        )}
      </Box>
      <CategoryBreakdownDialog
        isOpen={breakdownDialog.isOpen}
        onClose={handleCloseBreakdown}
        categoryName={breakdownDialog.categoryName}
        transactions={breakdownDialog.transactions}
        totalAmount={breakdownDialog.totalAmount}
      />
    </>
  ) : (
    emptyPlaceholder
  );
};

export default StaffReportTable;
