import { Box, styled } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export const GridContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-columnHeaderTitle': {
    fontWeight: theme.typography.fontWeightBold,
  },
  '.MuiDataGrid-row.top-border .MuiDataGrid-cell': {
    borderTop: `2px solid ${theme.palette.divider}`,
  },
  '.MuiDataGrid-row.bold-row': {
    fontWeight: 'bold',
  },
  '.MuiDataGrid-row.bottom-border .MuiDataGrid-cell': {
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  '.category-cell': {
    lineHeight: 1.3,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
})) as typeof DataGrid;
