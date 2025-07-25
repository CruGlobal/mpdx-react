import React, { useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { dateFormatShort } from 'src/lib/intlFormat';
import { Transaction } from '../StaffExpenseReport';

interface IncomeTableProps {
  transactions: Transaction[];
  transfersIn: number;
  emptyPlaceholder: React.ReactElement;
  loading?: boolean;
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

export interface IncomeRow {
  id: string;
  date: DateTime;
  description: string;
  transactionAmount: number;
}

type RenderCell = GridColDef<IncomeRow>['renderCell'];

export const createIncomeRow = (
  transaction: {
    description: string;
    date: string;
    amount: number;
  },
  index: number,
): IncomeRow => ({
  id: index.toString(),
  date: DateTime.fromISO(transaction.date),
  description: transaction.description,
  transactionAmount: transaction.amount,
});

const IncomeTable: React.FC<IncomeTableProps> = ({
  transactions,
  transfersIn,
  emptyPlaceholder,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [pageSize, setPageSize] = useState(5);

  const incomeRows = useMemo(
    () =>
      (transactions ?? [])
        .filter((transaction) => transaction.total > 0)
        .map((transaction, index) =>
          createIncomeRow(
            {
              date: transaction.month,
              description: transaction.category,
              amount: transaction.total,
            },
            index,
          ),
        ),
    [transactions],
  );

  const date: RenderCell = ({ row }) => {
    return dateFormatShort(row.date, locale);
  };

  const description: RenderCell = ({ row }) => (
    <Tooltip title={t(row.description)}>
      <Typography variant="body2" noWrap>
        {t(row.description)}
      </Typography>
    </Tooltip>
  );

  const amount: RenderCell = ({ row }) => {
    if (row.transactionAmount > 0) {
      return (
        <Typography variant="body2" noWrap>
          {row.transactionAmount.toLocaleString(locale, {
            style: 'currency',
            currency: 'USD',
          })}
        </Typography>
      );
    }
    return null;
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

  const localeText = useDataGridLocaleText();

  return transactions.length ? (
    <Box
      sx={{
        mt: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'space-between',
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6">{t('Income')}</Typography>
      </Box>
      <Box width="100%">
        <StyledGrid
          rows={incomeRows || []}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(size) => setPageSize(size)}
          pagination
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model)}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          autoHeight
          disableVirtualization
          localeText={localeText}
        />
        <Box display="flex" justifyContent="flex-end" mt={2} mr={6}>
          <Typography fontWeight="bold">
            {t('Total Income:')}{' '}
            <span style={{ color: 'green' }}>
              {transfersIn.toLocaleString(locale, {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          </Typography>
        </Box>
      </Box>
    </Box>
  ) : loading ? (
    <LoadingBox>
      <LoadingIndicator data-testid="LoadingBox" color="primary" size={50} />
    </LoadingBox>
  ) : (
    emptyPlaceholder
  );
};

export default IncomeTable;
