import { useMemo } from 'react';
import { Tooltip, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { amountFormat, zeroAmountFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { populateTotalRows } from '../Helper/createRows';
import { useReport } from '../ReportContext/ReportContext';
import { DataFields } from '../mockData';
import { StyledTotalRow } from '../styledComponents';
import { descriptionWidth, monthWidth, summaryWidth } from './TableCard';

export type RenderTotalCell = GridColDef<Row>['renderCell'];

interface Row {
  id: string;
  description: string;
  monthlyValue: number[];
  avgTotal: number | undefined;
  overall: number | undefined;
}

interface TotalRowProps {
  data: DataFields[];
  overallTotal: number | undefined;
}

export const TotalRow: React.FC<TotalRowProps> = ({ data, overallTotal }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { isFutureMonth } = useReport();

  const monthlyTotals = useMemo(
    () =>
      data[0]?.monthly
        ? data[0].monthly.map((_, monthIndex) =>
            data.reduce(
              (acc, curr) => acc + (curr.monthly?.[monthIndex] ?? 0),
              0,
            ),
          )
        : [],
    [data],
  );
  const avgSum = useMemo(
    () => (data ?? []).reduce((sum, row) => sum + row.average, 0),
    [data],
  );

  const totalRow = (): Row => ({
    id: 'totals-row',
    description: t('Overall Total'),
    monthlyValue: monthlyTotals,
    avgTotal: avgSum,
    overall: overallTotal,
  });

  const { description, average, overall } = useMemo(
    () => populateTotalRows(locale),
    [locale],
  );

  const columns: GridColDef[] = useMemo(() => {
    const monthColumns: GridColDef[] = monthlyTotals.map((_, index) => ({
      field: `monthlyValue_${index}`,
      headerName: '',
      width: monthWidth,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'right',
      cellClassName: isFutureMonth(index) ? 'future-month' : undefined,
      renderCell: ({ row }) => {
        const formattedValue = zeroAmountFormat(
          row.monthlyValue[index],
          locale,
        );
        return (
          <Tooltip title={amountFormat(row.monthlyValue[index], locale)}>
            <Typography variant="body2" noWrap>
              {formattedValue}
            </Typography>
          </Tooltip>
        );
      },
    }));

    return [
      {
        field: 'description',
        headerName: '',
        width: descriptionWidth,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: description,
      },
      ...monthColumns,
      {
        field: 'avgTotal',
        headerName: '',
        width: summaryWidth,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        renderCell: average,
      },
      {
        field: 'overallTotal',
        headerName: '',
        width: summaryWidth,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        renderCell: overall,
      },
    ];
  }, [monthlyTotals, isFutureMonth, locale, description, average, overall]);

  return (
    <StyledTotalRow
      rows={[totalRow()]}
      columns={columns}
      hideFooter
      disableColumnMenu
      disableRowSelectionOnClick
      sx={{
        '& .MuiDataGrid-columnHeaders': { display: 'none' },
        '& .MuiDataGrid-virtualScroller': { marginTop: '0 !important' },
        '& .MuiDataGrid-cell': { borderBottom: 'none' },
        '& .MuiDataGrid-main': { border: 'none' },
        '& .future-month': { backgroundColor: theme.palette.action.hover },
      }}
    />
  );
};
