import React, { ReactElement } from 'react';
import { mdiDelete, mdiSquareEditOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton } from '@mui/material';
import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import i18n from 'i18next';
import { makeStyles } from 'tss-react/mui';
import { TestAppeal } from 'pages/accountLists/[accountListId]/tools/appeals/testAppeal';
import theme from '../../../../theme';
import { useAppealContext } from '../AppealContextProvider/AppealContextProvider';
import AppealDetailsNoData from './AppealDetailsNoData';

const useStyles = makeStyles()(() => ({
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
    minWidth: 200,
    flex: 1,
  },
  {
    field: 'amount',
    headerName: i18n.t('Amount Received'),
    minWidth: 150,
    flex: 1,
  },
  {
    field: 'date',
    headerName: i18n.t('Date Received'),
    minWidth: 200,
    flex: 1,
  },
  {
    field: 'actions',
    headerName: i18n.t('Actions'),
    minWidth: 100,
    flex: 0.3,
    sortable: false,
    renderCell: function renderActions() {
      const { classes } = useStyles();
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

export interface Props {
  appeal: TestAppeal;
}

const AppealDetailsReceived = ({ appeal }: Props): ReactElement => {
  const { classes } = useStyles();
  const { appealState, setAppealState } = useAppealContext();

  const rows = appeal.received.map((donation, index) => ({
    id: index,
    contact: donation.name,
    amount: `${donation.amount?.toFixed(2)} ${donation.currency}`,
    date: donation.date,
  }));

  const updateSelected = (e: GridSelectionModel): void => {
    const temp: string[] = e.map(
      (index) => rows[parseInt(index.toString())].contact,
    );
    setAppealState({ ...appealState, selected: [...temp] });
  };
  return appeal.received.length > 0 ? (
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
  ) : (
    <AppealDetailsNoData />
  );
};

export default AppealDetailsReceived;
