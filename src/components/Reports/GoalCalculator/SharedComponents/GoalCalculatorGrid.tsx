import React from 'react';
import { styled } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';

const StyledDataGrid = styled(DataGrid)({
  borderRadius: 0,
  border: 'none',
  '& .MuiDataGrid-columnHeader': {
    fontWeight: 'bold !important',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold !important',
  },
  '& .MuiDataGrid-columnSeparator': {
    display: 'none',
  },
  '& .MuiDataGrid-row[data-id="total"]': {
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
    '&:focus': {
      backgroundColor: 'transparent !important',
      outline: 'none !important',
    },
    '&.Mui-focusVisible': {
      backgroundColor: 'transparent !important',
      outline: 'none !important',
    },
  },
  '& .MuiDataGrid-row[data-id="total"] .MuiDataGrid-cell': {
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
    '&:focus': {
      backgroundColor: 'transparent !important',
      outline: 'none !important',
    },
    '&.Mui-focusVisible': {
      backgroundColor: 'transparent !important',
      outline: 'none !important',
    },
  },
  '& .MuiDataGrid-row[data-id="total"] .MuiDataGrid-cell--editable': {
    cursor: 'default',
  },
});

export const GoalCalculatorGrid: React.FC<DataGridProps> = (props) => {
  return (
    <StyledDataGrid
      hideFooter
      disableRowSelectionOnClick
      hideFooterSelectedRowCount
      rowHeight={38}
      columnHeaderHeight={38}
      isCellEditable={(params) => params.id !== 'total'}
      isRowSelectable={(params) => params.id !== 'total'}
      {...props}
    />
  );
};
