import React from 'react';
import { styled } from '@mui/material';
import { DataGrid, DataGridProps, GridApi } from '@mui/x-data-grid';

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

interface StyledGridProps extends DataGridProps {
  directInput: boolean;
}

export const StyledGrid = React.forwardRef<GridApi, StyledGridProps>(
  (props, ref) => {
    return (
      <StyledDataGrid
        apiRef={ref as React.MutableRefObject<GridApi | null>}
        hideFooter
        disableRowSelectionOnClick
        disableColumnSorting
        disableColumnMenu
        hideFooterSelectedRowCount
        rowHeight={38}
        columnHeaderHeight={38}
        isCellEditable={(params) => params.id !== 'total' || props.directInput}
        isRowSelectable={(params) => params.id !== 'total' || props.directInput}
        {...props}
      />
    );
  },
);

StyledGrid.displayName = 'StyledGrid';
