import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

export const StyledGrid = styled(DataGrid)(() => ({
  '.MuiDataGrid-row:nth-of-type(2n + 1):not(:hover)': {
    backgroundColor: '#E3F2FD',
  },
  '.MuiDataGrid-cell': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    alignItems: 'center',
    display: 'flex',
    fontSize: '1.15em',
  },
  '.MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
    fontSize: '15px',
  },
}));
