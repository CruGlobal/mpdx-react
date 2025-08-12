import React, { useMemo, useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { GridToolbarProps } from '@mui/x-data-grid/internals';
import { useTranslation } from 'react-i18next';
import { CardSkeleton } from '../Card/CardSkeleton';
import { CustomToolbar } from '../CustomToolbar/CustomToolbar';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { populateCardTableRows } from '../Helper/createTableRows';
import { DataFields } from '../mockData';
import { LoadingBox, LoadingIndicator, StyledGrid } from '../styledComponents';
import { TotalsRow } from './TotalsRow';

export type RenderCell = GridColDef<DataFields>['renderCell'];

export interface TableCardProps {
  type: ReportTypeEnum;
  data: DataFields[];
  overallTotal: number | undefined;
  emptyPlaceholder: React.ReactElement;
  title: string;
  months: string[];
  loading?: boolean;
}

export const CreateCardTableRows = (incomeData: DataFields): DataFields => ({
  id: incomeData.id,
  description: incomeData.description,
  monthly: incomeData.monthly,
  average: incomeData.average,
  total: incomeData.total,
});

export const descriptionWidth = 175;
export const monthWidth = 65;
export const summaryWidth = 98.5;

export const TableCard: React.FC<TableCardProps> = ({
  type,
  data,
  overallTotal,
  title,
  months,
  emptyPlaceholder,
  loading,
}) => {
  const { t } = useTranslation();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: 'description',
      sort: 'desc',
    },
  ]);

  const cardTableRows = useMemo(() => {
    return data.map((data) => CreateCardTableRows(data));
  }, [data]);

  const tableLength = useMemo(() => cardTableRows.length, [cardTableRows]);

  const { description, average, total } = populateCardTableRows();

  const columns = useMemo<GridColDef<DataFields>[]>(() => {
    const monthColumns: GridColDef<DataFields>[] = months.map(
      (month, index) => ({
        field: `month${index}`,
        headerName: month.split(' ')[0],
        width: monthWidth,
        type: 'number',
        valueGetter: (_value, row) => {
          const v = row.monthly?.[index];
          return typeof v === 'number' ? v : null;
        },
        valueFormatter: (value) => {
          if (value === null) {
            return '';
          }
          return value === 0 ? '-' : (value as number);
        },
        renderCell: (params) => {
          return (
            <Tooltip title={params.value === null ? '' : String(params.value)}>
              <Typography variant="body2" noWrap>
                {params.formattedValue as string}
              </Typography>
            </Tooltip>
          );
        },
      }),
    );

    return [
      {
        field: 'description',
        headerName: t('Description'),
        width: descriptionWidth,
        renderCell: description,
      },
      ...monthColumns,
      {
        field: 'average',
        headerName: t('Average'),
        width: summaryWidth,
        renderCell: average,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'total',
        headerName: t('Total'),
        width: summaryWidth,
        renderCell: total,
        align: 'right',
        headerAlign: 'right',
      },
    ];
  }, [months]);

  return loading ? (
    <LoadingBox>
      <LoadingIndicator
        data-testid="loading-spinner"
        color="primary"
        size={50}
      />
    </LoadingBox>
  ) : data.length ? (
    <CardSkeleton
      title={title}
      subtitle={t('Last 12 Months')}
      styling={{ padding: 0, '&:last-child': { paddingBottom: 0 } }}
    >
      <Box>
        <StyledGrid
          rows={cardTableRows}
          columns={columns}
          getRowId={(row) => row.id}
          sortingOrder={['desc', 'asc']}
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model)}
          pageSizeOptions={[5, 10, 25, { label: 'All', value: tableLength }]}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel(model)}
          disableVirtualization
          disableRowSelectionOnClick
          pagination
          disableColumnMenu
          slots={{
            toolbar: CustomToolbar,
          }}
          slotProps={{
            toolbar: {
              data: data,
              type: type,
              months: months,
            } as unknown as GridToolbarProps,
          }}
          showToolbar
        />
        <Box>
          <TotalsRow data={data} overallTotal={overallTotal} />
        </Box>
      </Box>
    </CardSkeleton>
  ) : (
    <CardSkeleton title={title} subtitle={t('Last 12 Months')}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        {emptyPlaceholder}
      </Box>
    </CardSkeleton>
  );
};
