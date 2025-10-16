import { Box, TableRow, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid, type DataGridProps } from '@mui/x-data-grid';
import theme from 'src/theme';
import { DataFields } from './mockData';

export const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
});

export const StyledGrid = styled((props: DataGridProps<DataFields>) => (
  <DataGrid<DataFields> {...props} />
))(() => ({
  fontSize: '11px',
  '.MuiDataGrid-row:nth-of-type(2n + 1):not(:hover)': {
    backgroundColor: '#E3F2FD',
  },
  '.MuiDataGrid-cell': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    alignItems: 'center',
    display: 'flex',
  },
  '.MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
    fontSize: '12px',
  },
  '.MuiDataGrid-cell *': {
    fontSize: '11px',
  },
  border: 'none',
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
}));

export const StyledTotalRow = styled(DataGrid)(() => ({
  backgroundColor: theme.palette.chartBlueLight.main,
  '.MuiDataGrid-cell': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    alignItems: 'center',
    display: 'flex',
  },
  '.MuiDataGrid-cell *': {
    fontSize: '11px',
    fontWeight: 'bold',
  },
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
}));

export const StyledRow = styled(TableRow)(() => ({
  '@media print': {
    '&:nth-of-type(odd)': {
      backgroundColor: '#E3F2FD !important',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
    },
  },
}));

export const StyledTypography = styled(Typography)(() => ({
  fontSize: '12px',
  '@media print': {
    fontSize: '8px',
  },
}));

export const PrintOnly = styled(Box)(() => ({
  visibility: 'hidden',
  pointerEvents: 'none',
  height: 0,
  overflow: 'hidden',
  margin: 0,
  padding: 0,
  width: '100%',

  '@media print': {
    visibility: 'visible',
    pointerEvents: 'auto',
    height: 'auto',
    overflow: 'visible',
    display: 'block',
  },
}));
