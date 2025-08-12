import {
  Box,
  Button,
  CircularProgress,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid, type DataGridProps } from '@mui/x-data-grid';
import theme from 'src/theme';
import { DataFields } from './mockData';

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

export const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
});

export const StyledPrintButton = styled(Button)({
  border: '1px solid',
  borderRadius: theme.spacing(1),
  marginLeft: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
});

export const StyledGrid = styled((props: DataGridProps<DataFields>) => (
  <DataGrid<DataFields> {...props} />
))(() => ({
  fontSize: '12px',
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
    fontSize: '12px',
  },
  border: 'none',
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

export const SimplePrintOnly = styled(Box)(() => ({
  display: 'none',
  '@media print': {
    display: 'block',
  },
}));

export const ScreenOnly = styled(Box)(() => ({
  '@media print': {
    display: 'none',
  },
}));
