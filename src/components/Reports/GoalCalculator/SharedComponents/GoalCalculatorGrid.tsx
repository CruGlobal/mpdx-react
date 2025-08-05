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
  // Hide actions column by default
  '& .MuiDataGrid-cell[data-field="actions"]': {
    '&:focus': {
      outline: 'none !important',
    },
    '&.Mui-focusVisible': {
      outline: 'none !important',
    },
    '& .MuiDataGrid-actionsCell': {
      opacity: 0,
      transition: 'opacity 0.2s ease-in-out',
    },
  },

  // Show actions column on row hover
  '& .MuiDataGrid-row:hover .MuiDataGrid-cell[data-field="actions"]': {
    opacity: 1,
    '& .MuiDataGrid-actionsCell': {
      opacity: 1,
    },
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
