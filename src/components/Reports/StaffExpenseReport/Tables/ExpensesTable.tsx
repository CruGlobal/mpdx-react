import React, { useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
//import { StaffExpenseReportQuery } from '../GetStaffExpense.generated';

type RenderCell = GridColDef<ExpenseRow>['renderCell'];

// interface ExpensesTableProps {
//   accountListId: string;
//   designationAccounts?: string[];
//   loading?: boolean;
//   data?: StaffExpenseReportQuery | undefined;
//   error?: ApolloError | undefined;
// }

// Mock Data for testing purposes
interface ExpensesTableProps {
  transactions: Transaction[];
  designationAccounts?: DesignationAccount[];
}

interface DesignationAccount {
  id: string;
  name: string;
  accountNumber: string;
}
interface Transaction {
  description: string;
  date: string;
  amount: number;
  category: string;
}

// End of mock data

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
    textAlign: 'left',
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

export interface ExpenseRow {
  date: DateTime;
  description: string;
  amount: number;
}

export const CreateExpenseRow = (data: Transaction): ExpenseRow => ({
  date: DateTime.fromISO(data.date),
  description: data.description,
  amount: data.amount,
});

export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  transactions,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [pageSize, setPageSize] = useState(25);

  const expenseTransactions = useMemo(() => {
    return transactions.map((data) => CreateExpenseRow(data));
  }, [transactions]);

  const date: RenderCell = ({ row }) => {
    return dateFormatShort(row.date, locale);
  };

  const description: RenderCell = ({ row }) => (
    <Tooltip title={row.description}>
      <Typography variant="body2" noWrap>
        {row.description}
      </Typography>
    </Tooltip>
  );

  const amount: RenderCell = ({ row }) => {
    if (row.amount < 0) {
      return (
        <Typography variant="body2" noWrap>
          {row.amount.toLocaleString(locale, {
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

  const negativeTransactions = expenseTransactions.filter(
    (tx) => tx.amount < 0,
  );

  const totalExpenses = negativeTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0,
  );

  return (
    <>
      {negativeTransactions.length > 0 ? (
        <StyledGrid
          rows={negativeTransactions}
          columns={columns}
          getRowId={(row) => `${row.date}-${row.description}`}
          sortingOrder={['desc', 'asc']}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          autoHeight
        />
      ) : (
        <Typography>{t('No expenses found')}</Typography>
      )}

      {totalExpenses !== 0 && (
        <TotalsTable aria-label={t('Expense Totals')}>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>{t('Total')}</strong>
              </TableCell>
              <TableCell
                style={{ color: 'red' }}
                align="right"
                sx={{ paddingRight: '75px' }}
              >
                {totalExpenses.toLocaleString(locale, {
                  style: 'currency',
                  currency: 'USD',
                })}
              </TableCell>
            </TableRow>
          </TableHead>
        </TotalsTable>
      )}
    </>
  );
};

export default ExpensesTable;
