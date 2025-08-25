import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

export const PrintOnly = styled(Box)({
  display: 'none',
  '@media print': {
    display: 'block',
  },
});

export const ScreenOnly = styled(Box)({
  '@media print': {
    display: 'none',
  },
});

export const StyledGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-row:nth-of-type(2n + 1):not(:hover)': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
  '.MuiDataGrid-cell': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    alignContent: 'center',
  },
}));
