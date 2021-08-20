import React, { ReactElement } from 'react';
import { Box, IconButton, makeStyles } from '@material-ui/core';
import { DataGrid, GridSelectionModel } from '@material-ui/data-grid';
import Icon from '@mdi/react';
import { mdiSquareEditOutline, mdiDelete } from '@mdi/js';
import i18n from 'i18next';
import { useAppealContext } from '../AppealContextProvider/AppealContextProvider';

import theme from '../../../../theme';

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 20,
    height: '60vh',
    '& .MuiDataGrid-row.Mui-odd': {
      backgroundColor: theme.palette.cruGrayLight.main,
    },
    '& .MuiDataGrid-columnHeader': {
      backgroundColor: theme.palette.mpdxBlue.main,
      color: 'white',
      height: '100%',
      '& .MuiCheckbox-colorPrimary.Mui-checked': {
        color: 'white',
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 600,
      },
    },
    '& .MuiDataGrid-columnHeaderWrapper': {
      '& .MuiDataGrid-cell': {
        backgroundColor: theme.palette.mpdxBlue.main,
      },
    },
    '& .MuiDataGrid-row:hover': {
      backgroundColor: theme.palette.cruGrayMedium.main,
      '& .MuiCheckbox-colorPrimary': {
        color: 'white',
      },
    },
    '& .MuiDataGrid-sortIcon': {
      color: 'white',
    },
    '& .MuiDataGrid-row.Mui-selected': {
      backgroundColor: `${theme.palette.mpdxYellow.main} !important`,
      '& .MuiCheckbox-colorPrimary': {
        color: `${theme.palette.mpdxBlue.main} !important`,
      },
    },
    '& .MuiSvgIcon-fontSizeSmall': {
      color: 'white',
    },
  },
  actionIconButton: {
    color: theme.palette.cruGrayDark.main,
    '&:hover': { color: theme.palette.mpdxBlue.main, cursor: 'pointer' },
  },
}));

const columns = [
  {
    field: 'contact',
    headerName: i18n.t('Contact'),
    flex: 1,
  },
  {
    field: 'amount',
    headerName: i18n.t('Amount Received'),
    flex: 1,
  },
  {
    field: 'date',
    headerName: i18n.t('Date Received'),
    flex: 1,
  },
  {
    field: 'actions',
    headerName: i18n.t('Actions'),
    flex: 0.3,
    sortable: false,
    renderCell: function renderActions() {
      const classes = useStyles();
      return (
        <>
          <IconButton className={classes.actionIconButton}>
            <Icon path={mdiSquareEditOutline} size={1} />
          </IconButton>
          <IconButton className={classes.actionIconButton}>
            <Icon path={mdiDelete} size={1} />
          </IconButton>
        </>
      );
    },
  },
];

const rows = [
  {
    id: 1,
    contact: 'Test 123',
    amount: '500.00 CAD',
    date: '06/14/2021',
  },
  { id: 2, contact: 'vvvv', amount: '5000.00 CAD', date: '06/22/2020' },
  { id: 3, contact: 'asdasd', amount: '212.00 CAD', date: '06/13/2021' },
  { id: 4, contact: 'test 1234', amount: '1.00 CAD', date: '03/14/2021' },
  { id: 5, contact: 'true', amount: '500.34 CAD', date: '02/14/1999' },
];

const AppealDetailsReceived = (): ReactElement => {
  const classes = useStyles();
  const { appealState, setAppealState } = useAppealContext();

  const updateSelected = (e: GridSelectionModel): void => {
    const temp: string[] = [];
    for (const x of e) {
      temp.push(rows[parseInt(x.toString()) - 1].contact);
    }
    setAppealState({ ...appealState, selected: [...temp] });
  };

  return (
    <Box component="div" className={classes.container}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        pageSize={25}
        rowsPerPageOptions={[10, 25, 50, 100]}
        disableSelectionOnClick
        onSelectionModelChange={updateSelected}
      />
    </Box>
  );
};

export default AppealDetailsReceived;
