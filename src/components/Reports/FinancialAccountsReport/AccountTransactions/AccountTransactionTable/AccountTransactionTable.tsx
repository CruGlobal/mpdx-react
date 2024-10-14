import React, { useContext, useMemo, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Maybe } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { formatNumber } from '../../AccountSummary/AccountSummaryHelper';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../../Context/FinancialAccountsContext';
import { FinancialAccountEntriesQuery } from '../financialAccountTransactions.generated';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-row:nth-of-type(2n + 1):not(:hover)': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
  '.MuiDataGrid-cell': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },

  '.MuiDataGrid-main .MuiDataGrid-row': {
    minHeight: '60px !important',
  },

  '.MuiDataGrid-main .MuiDataGrid-row[data-id="openingBalanceRow"], .MuiDataGrid-main .MuiDataGrid-row[data-id="closingBalanceRow"]':
    {
      backgroundColor: theme.palette.cruGrayMedium.main,
      fontWeight: 'bold',
    },
}));

const TotalsTable = styled(Table)(({ theme }) => ({
  marginBottom: theme.spacing(8),
  '.MuiTableCell-root': {
    fontWeight: 'bold',
  },

  '.MuiTableRow-root .MuiTableCell-root': {
    textAlign: 'right',
  },
}));

export enum FinancialAccountEntryTypeEnum {
  Credit = 'FinancialAccount::Entry::Credit',
  Debit = 'FinancialAccount::Entry::Debit',
}

type RenderCell = GridColDef<TransactionRow>['renderCell'];

interface TransactionRow {
  id: string;
  code?: Maybe<string>;
  description?: Maybe<string>;
  type?: Maybe<string>;
  categoryName: string;
  categoryCode: string;
  currency?: Maybe<string>;
  expenseAmount?: Maybe<string>;
  incomeAmount?: Maybe<string>;
  entryDate: DateTime<boolean>;
}

const createTransactionRow = (
  entry: FinancialAccountEntriesQuery['financialAccountEntries']['entries'][0],
): TransactionRow => {
  const { category: _category, amount, ...rest } = entry;
  const amounts =
    entry.type === FinancialAccountEntryTypeEnum.Debit
      ? { expenseAmount: amount }
      : { incomeAmount: amount };
  return {
    ...rest,
    ...amounts,
    categoryName: entry.category.name ?? entry.category.code ?? '',
    categoryCode: entry.category.code ?? '',
    entryDate: DateTime.fromISO(entry.entryDate),
  };
};

interface CreateBalanceRowProps {
  id: string;
  description: string;
  currency?: string | null;
  incomeAmount?: string | null;
  expenseAmount?: string | null;
  entryDate: DateTime;
}

const createBalanceRow = ({
  id,
  description,
  currency,
  incomeAmount = '',
  expenseAmount = '',
  entryDate,
}: CreateBalanceRowProps): TransactionRow => {
  return {
    id,
    code: '',
    description,
    type: FinancialAccountEntryTypeEnum.Credit,
    categoryName: '',
    categoryCode: '',
    currency: currency ?? 'USD',
    incomeAmount: incomeAmount ?? '0',
    expenseAmount: expenseAmount ?? '0',
    entryDate,
  };
};

const isBalanceRow = (id: string) =>
  id === 'openingBalanceRow' || id === 'closingBalanceRow';

interface TableProps {
  financialAccountEntries: FinancialAccountEntriesQuery['financialAccountEntries'];
  defaultStartDate: string;
  defaultEndDate: string;
}

export const AccountTransactionTable: React.FC<TableProps> = ({
  financialAccountEntries,
  defaultStartDate,
  defaultEndDate,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [pageSize, setPageSize] = useState(25);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ]);

  const { activeFilters } = useContext(
    FinancialAccountContext,
  ) as FinancialAccountType;

  const { entries, metaData } = financialAccountEntries;
  const {
    credits,
    debits,
    difference,
    currency,
    openingBalance,
    closingBalance,
  } = metaData;

  const transactions = useMemo(() => {
    const transactionRows = entries.map((entry) => createTransactionRow(entry));

    if (!!activeFilters.categoryId) {
      return transactionRows;
    } else {
      return [
        createBalanceRow({
          id: 'closingBalanceRow',
          currency,
          description: t('Closing Balance'),
          incomeAmount: closingBalance,
          entryDate: DateTime.fromISO(
            activeFilters.dateRange?.max ?? defaultEndDate,
          ),
        }),
        ...transactionRows,
        createBalanceRow({
          id: 'openingBalanceRow',
          currency,
          description: t('Opening Balance'),
          incomeAmount: openingBalance,
          entryDate: DateTime.fromISO(
            activeFilters.dateRange?.min ?? defaultStartDate,
          ),
        }),
      ];
    }
  }, [entries, currency, openingBalance, closingBalance, activeFilters]);

  const Date: RenderCell = ({ row }) => (
    <Typography>{dateFormatShort(row.entryDate, locale)}</Typography>
  );
  const Category: RenderCell = ({ row }) => (
    <Box>
      <Typography sx={{ textWrap: 'wrap' }}>{row.categoryName}</Typography>
      <Typography variant="body2">{row.categoryCode}</Typography>
    </Box>
  );
  const Details: RenderCell = ({ row }) => (
    <Box>
      <Typography
        sx={{
          textWrap: 'wrap',
          fontWeight: isBalanceRow(row.id) ? 'bold' : 'inherit',
        }}
      >
        {row.description}
      </Typography>
      <Typography variant="body2">{row.code}</Typography>
    </Box>
  );
  const Expenses: RenderCell = ({ row }) => {
    if (row.type === FinancialAccountEntryTypeEnum.Debit) {
      return (
        <Typography
          sx={{
            fontWeight: isBalanceRow(row.id) ? 'bold' : 'inherit',
          }}
        >
          {currencyFormat(
            formatNumber(row.expenseAmount),
            row.currency,
            locale,
          )}
        </Typography>
      );
    }
    return '';
  };
  const Income: RenderCell = ({ row }) => {
    if (row.type === FinancialAccountEntryTypeEnum.Credit) {
      return (
        <Typography
          sx={{
            fontWeight: isBalanceRow(row.id) ? 'bold' : 'inherit',
          }}
        >
          {currencyFormat(formatNumber(row.incomeAmount), row.currency, locale)}
        </Typography>
      );
    }
    return '';
  };

  const columns: GridColDef[] = [
    {
      field: 'entryDate',
      headerName: t('Date'),
      flex: 1,
      minWidth: 80,
      renderCell: Date,
    },
    {
      field: 'categoryName',
      headerName: t('Category'),
      flex: 2,
      minWidth: 200,
      renderCell: Category,
    },
    {
      field: 'description',
      headerName: t('Details'),
      flex: 3,
      minWidth: 300,
      renderCell: Details,
    },
    {
      field: 'expenseAmount',
      headerName: t('Expenses'),
      flex: 1,
      minWidth: 120,
      renderCell: Expenses,
    },
    {
      field: 'incomeAmount',
      headerName: t('Income'),
      flex: 1,
      minWidth: 120,
      renderCell: Income,
      align: 'right',
    },
  ];

  return (
    <>
      <StyledDataGrid
        rows={transactions}
        rowCount={transactions.length}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={(pageSize) => setPageSize(pageSize)}
        rowsPerPageOptions={[25, 50, 100]}
        pagination
        sortModel={sortModel}
        onSortModelChange={(sortModel) => setSortModel(sortModel)}
        disableSelectionOnClick
        disableVirtualization
        disableColumnMenu
        rowHeight={70}
        autoHeight
        getRowHeight={() => 'auto'}
      />
      <TotalsTable aria-label={t('Donation Totals')}>
        <TableBody>
          <TotalTableRow title={t('Totals for Period')} />

          <TotalTableRow
            title={t('Income:')}
            amount={credits}
            currency={currency}
            locale={locale}
          />

          <TotalTableRow
            title={t('Expenses:')}
            amount={debits}
            currency={currency}
            locale={locale}
          />

          <TotalTableRow
            title={t('Differences:')}
            amount={difference}
            currency={currency}
            locale={locale}
          />
        </TableBody>
      </TotalsTable>
    </>
  );
};

interface TotalTableRowProps {
  title: string;
  amount?: string | null;
  currency?: string | null;
  locale?: string;
}

const TotalTableRow: React.FC<TotalTableRowProps> = ({
  title,
  amount,
  currency,
  locale,
}) => (
  <TableRow>
    <TableCell sx={{ paddingRight: 1 }} align="right">
      <Typography variant="body1" fontWeight="bold">
        {title}
      </Typography>
    </TableCell>
    <TableCell sx={{ width: 150, paddingRight: 2 }}>
      {amount &&
        currency &&
        locale &&
        currencyFormat(formatNumber(amount), currency, locale)}
    </TableCell>
  </TableRow>
);
