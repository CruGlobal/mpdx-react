import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

export const StyledFundDataGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-row:nth-of-type(2n + 1):not(:hover)': {
    backgroundColor: theme.palette.mpdxGrayLight.main,
  },
  '.MuiDataGrid-cell': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    alignContent: 'center',
  },
  // On phones the table scrolls sideways, so keep the Actions column pinned
  // to the right edge where it can always be tapped.
  [theme.breakpoints.down('sm')]: {
    '.MuiDataGrid-columnHeader[data-field="actions"], .MuiDataGrid-cell[data-field="actions"]':
      {
        position: 'sticky',
        right: 0,
        // Same layers the grid uses for its own pinned columns.
        zIndex: 30,
        backgroundColor: theme.palette.background.paper,
        // A shadow instead of a border, so the two buttons still fit the cell.
        boxShadow: `inset 2px 0 0 ${theme.palette.grey[400]}`,
      },
    // Keeps the other columns' separator lines from drawing over the header.
    '.MuiDataGrid-columnHeader[data-field="actions"]': {
      zIndex: 40,
    },
    '.MuiDataGrid-row:nth-of-type(2n + 1) .MuiDataGrid-cell[data-field="actions"]':
      {
        backgroundColor: theme.palette.mpdxGrayLight.main,
      },
    // The solid background would otherwise hide the row's hover tint.
    '.MuiDataGrid-row:hover .MuiDataGrid-cell[data-field="actions"]': {
      backgroundColor: theme.palette.background.paper,
      backgroundImage: `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
    },
  },
}));
