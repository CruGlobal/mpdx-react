import React, { useMemo, useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { amountFormat, zeroAmountFormat } from 'src/lib/intlFormat';
import { LoadingBox, LoadingIndicator } from '../../styledComponents';
import { CardSkeleton } from '../Card/CardSkeleton';
import { CustomToolbar } from '../CustomToolbar/CustomToolbar';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { populateCardTableRows } from '../Helper/createRows';
import { useTotals } from '../TotalsContext/TotalsContext';
import { DataFields } from '../mockData';
import { StyledGrid } from '../styledComponents';
import { TotalRow } from './TotalRow';

export type RenderCell = GridColDef<DataFields>['renderCell'];

export interface TableCardProps {
  type: ReportTypeEnum;
  data: DataFields[];
  emptyPlaceholder: React.ReactElement;
  title: string;
  months: string[];
  loading?: boolean;
}

export const CreateCardTableRows = (data: DataFields): DataFields => ({
  id: data.id,
  description: data.description,
  monthly: data.monthly,
  average: data.average,
  total: data.total,
});

export const descriptionWidth = 175;
export const monthWidth = 65;
export const summaryWidth = 98.5;

const createToolbar = (
  data: DataFields[],
  type: ReportTypeEnum,
  months: string[],
) => {
  const Toolbar = () => (
    <CustomToolbar data={data} type={type} months={months} />
  );
  Toolbar.displayName = 'MPGATableCustomToolbar';
  return Toolbar;
};

export const TableCard: React.FC<TableCardProps> = ({
  type,
  data,
  title,
  months,
  emptyPlaceholder,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { incomeTotal, expensesTotal } = useTotals();

  const overallTotal =
    type === ReportTypeEnum.Income ? incomeTotal : expensesTotal;

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

  const { description, average, total } = populateCardTableRows(locale);

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
        renderCell: (params) => {
          const formattedValue = zeroAmountFormat(params.value, locale);
          return (
            <Tooltip title={amountFormat(params.value, locale)}>
              <Typography variant="body2" noWrap>
                {formattedValue}
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
            toolbar: createToolbar(data, type, months),
          }}
          showToolbar
        />
        <Box>
          <TotalRow data={data} overallTotal={overallTotal} />
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
