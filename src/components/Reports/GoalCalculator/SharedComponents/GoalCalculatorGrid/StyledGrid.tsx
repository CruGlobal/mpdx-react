import React from 'react';
import { styled } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';

const StyledDataGrid = styled(DataGrid)({
  border: 'none',
  '.MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
  },
  '.MuiDataGrid-columnSeparator': {
    display: 'none',
  },
  '.MuiDataGrid-cell[data-field="actions"]': {
    '&:focus': {
      outline: 'none',
    },
    '.MuiDataGrid-actionsCell': {
      opacity: 0,
      transition: 'opacity 0.2s ease-in-out',
    },
  },
  '.MuiDataGrid-row:hover .MuiDataGrid-cell[data-field="actions"]': {
    opacity: 1,
    '.MuiDataGrid-actionsCell': {
      opacity: 1,
    },
  },
  '.MuiDataGrid-row[data-id="total"]': {
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&:focus': {
      backgroundColor: 'transparent',
      outline: 'none',
    },
  },
  '.MuiDataGrid-row[data-id="total"] .MuiDataGrid-cell': {
    '&:focus': {
      backgroundColor: 'transparent',
      outline: 'none',
    },
  },
});

export const StyledGrid: React.FC<DataGridProps> = (props) => {
  return (
    <StyledDataGrid
      hideFooter
      disableRowSelectionOnClick
      disableColumnSorting
      disableColumnMenu
      hideFooterSelectedRowCount
      rowHeight={38}
      columnHeaderHeight={38}
      isCellEditable={(params) => params.id !== 'total'}
      isRowSelectable={(params) => params.id !== 'total'}
      {...props}
    />
  );
};
