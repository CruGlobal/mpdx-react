import { Box, styled } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export const GridContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledGrid = styled(DataGrid)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  '.MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
    color: theme.palette.mpdxBlue.main,
  },
  '.MuiDataGrid-row.top-border .MuiDataGrid-cell': {
    borderTop: `2px solid ${theme.palette.divider}`,
  },
  '.MuiDataGrid-row.bold-row': {
    fontWeight: 'bold',
  },
  '.MuiDataGrid-row[data-id="total"]': {
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
  '.category-formula': {
    display: 'block',
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
  },
})) as typeof DataGrid;
