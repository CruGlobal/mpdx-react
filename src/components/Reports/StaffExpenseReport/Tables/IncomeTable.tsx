import React, { useMemo, useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useDataGridLocaleText } from 'src/hooks/useMuiLocaleText';
import { dateFormatShort } from 'src/lib/intlFormat';

interface Transaction {
  description: string;
  date: string;
  amount: number;
  category: string;
}

interface IncomeTableProps {
  // accountListId: string;
  // designationAccounts?: string[];
  // fundTypes?: string[];
  transactions?: Transaction[];
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

const getColumns = (locale: string): GridColDef[] => [
  {
    field: 'date',
    headerName: 'Transaction Date',
    width: 180,
    valueFormatter: ({ value }) => dateFormatShort(value, locale),
  },
  { field: 'description', headerName: 'Description', width: 300 },
  {
    field: 'transactionAmount',
    headerName: 'Transaction Amount',
    width: 180,
    valueFormatter: ({ value }) =>
      value.toLocaleString(locale, { style: 'currency', currency: 'USD' }),
  },
];

export interface IncomeRow {
  id: string;
  date: DateTime;
  description: string;
  transactionAmount: number;
}

export const createIncomeRow = (
  transaction: {
    description: string;
    date: string;
    amount: number;
    category: string;
  },
  index: number,
): IncomeRow => ({
  id: index.toString(),
  date: DateTime.fromISO(transaction.date),
  description: transaction.description,
  transactionAmount: transaction.amount,
});

const IncomeTable: React.FC<IncomeTableProps> = ({ transactions }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [pageSize, setPageSize] = useState(25);

  const incomeRows = useMemo(
    () =>
      (transactions ?? []).map((transaction, index) =>
        createIncomeRow(transaction, index),
      ),
    [transactions],
  );

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ]);

  const localeText = useDataGridLocaleText();

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Box display="flex" justifyContent="center" mb={2}>
        <Typography variant="h6">{t('Income')}</Typography>
      </Box>
      <Box height={400} width="100%">
        <StyledGrid
          rows={incomeRows || []}
          columns={getColumns(locale)}
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
      </Box>
    </Box>
  );
};

export default IncomeTable;
