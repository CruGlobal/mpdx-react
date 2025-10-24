import React, { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  LoadingBox,
  LoadingIndicator,
} from 'src/components/Shared/styledComponents/LoadingStyling';
import { useLocale } from 'src/hooks/useLocale';
import { usePopulateMonthlyDonationTableRows } from 'src/hooks/usePopulateMonthlyDonationTableRows';
import { currencyFormat } from 'src/lib/intlFormat';
import { TableData } from '../mockData';
import { StyledGrid } from '../styledComponents/StyledGrid';

export type RenderCell = GridColDef<TableData>['renderCell'];

export interface MonthlyDonationTableProps {
  data: TableData[];
  totalDonations: number;
  emptyPlaceholder: React.ReactElement;
  loading?: boolean;
}

const CreateTableRow = (data: TableData): TableData => ({
  id: data.id,
  name: data.name,
  date: data.date,
  type: data.type,
  amount: data.amount,
});

export const MonthlyDonationTable: React.FC<MonthlyDonationTableProps> = ({
  data,
  totalDonations,
  emptyPlaceholder,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: 'name',
      sort: 'asc',
    },
  ]);

  const rows = useMemo(() => {
    return data.map((data) => CreateTableRow(data));
  }, [data]);

  const { id, name, date, type, amount } =
    usePopulateMonthlyDonationTableRows(locale);

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: t('Donor ID'),
      width: 220,
      renderCell: id,
    },
    {
      field: 'name',
      headerName: t('Ministry Partner'),
      width: 270,
      renderCell: name,
    },
    {
      field: 'date',
      headerName: t('Date'),
      width: 220,
      renderCell: date,
    },
    {
      field: 'type',
      headerName: t('Type'),
      width: 220,
      renderCell: type,
    },
    {
      field: 'amount',
      headerName: t('Amount'),
      width: 220,
      renderCell: amount,
    },
  ];

  return loading ? (
    <LoadingBox>
      <LoadingIndicator
        data-testid="loading-spinner"
        color="primary"
        size={50}
      />
    </LoadingBox>
  ) : data.length ? (
    <Box>
      <StyledGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        pageSizeOptions={[5, 10, 25, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => setPaginationModel(model)}
        disableVirtualization
        disableRowSelectionOnClick
        pagination
      />
      <Box mt={2} mb={4}>
        <Typography>
          {t(`Total Donations (${data.length}):`)}{' '}
          <Typography component="span" sx={{ fontWeight: 'bold' }}>
            {currencyFormat(totalDonations, 'USD', locale, {
              showTrailingZeros: true,
            })}
          </Typography>
        </Typography>
      </Box>
    </Box>
  ) : (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      {emptyPlaceholder}
    </Box>
  );
};
