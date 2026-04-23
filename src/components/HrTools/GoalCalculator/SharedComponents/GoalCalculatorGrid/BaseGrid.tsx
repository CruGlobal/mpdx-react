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

/**
 * Browsers reject setSelectionRange on input type="number". To pre-select
 * the full value when the user opens a numeric cell for editing, temporarily
 * flip the input to type="text", select the range, then flip back. The
 * requestAnimationFrame is required because onCellEditStart fires before MUI
 * has mounted the edit input.
 */
const selectAllOnEditStart: DataGridProps['onCellEditStart'] = (
  _params,
  event,
) => {
  requestAnimationFrame(() => {
    const input =
      event.target instanceof HTMLElement &&
      event.target.querySelector('input');
    if (!input) {
      return;
    }
    input.type = 'text';
    input.setSelectionRange(0, input.value.length);
    input.type = 'number';
  });
};

export const BaseGrid: React.FC<DataGridProps> = (props) => {
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
      onCellEditStart={selectAllOnEditStart}
      {...props}
    />
  );
};
