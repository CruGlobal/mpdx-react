import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';

const columns = [
  { field: 'contact', headerName: 'Contact', flex: 1 },
  { field: 'amount', headerName: 'Amount Received', flex: 1 },
  { field: 'date', headerName: 'Date Received', flex: 1 },
];

const rows = [
  { id: 1, contact: 'Test 123', amount: '500.00 CAD', date: '06/14/2021' },
  { id: 2, contact: 'vvvv', amount: '5000.00 CAD', date: '06/22/2020' },
  { id: 3, contact: 'asdasd', amount: '212.00 CAD', date: '06/13/2021' },
  { id: 4, contact: 'test 1234', amount: '1.00 CAD', date: '03/14/2021' },
  { id: 5, contact: 'true', amount: '500.34 CAD', date: '02/14/1999' },
];

const AppealDetailsReceived = (): ReactElement => {
  return (
    <Box
      component="div"
      style={{
        marginTop: 20,
        height: '60vh',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        pageSize={25}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
};

export default AppealDetailsReceived;
