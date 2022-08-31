import React, { ReactElement } from 'react';
import { Box, IconButton, makeStyles } from '@mui/material';
import { DataGrid } from '@material-ui/data-grid';
import Icon from '@mdi/react';
import { mdiAccountPlus } from '@mdi/js';
import i18n from 'i18next';
import theme from '../../../../theme';
import { TestAppeal } from '../../../../../pages/accountLists/[accountListId]/tools/appeals/testAppeal';
import AppealDetailsNoData from './AppealDetailsNoData';

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
    minWidth: 200,
    flex: 1,
  },
  {
    field: 'reason',
    headerName: i18n.t('Reason'),
    minWidth: 200,
    flex: 1,
  },
  {
    field: 'regularGiving',
    headerName: i18n.t('Regular Giving'),
    minWidth: 200,
    flex: 1,
  },
  {
    field: 'actions',
    headerName: i18n.t('Actions'),
    minWidth: 100,
    flex: 0.25,
    sortable: false,
    renderCell: function renderActions() {
      const classes = useStyles();
      return (
        <>
          <IconButton className={classes.actionIconButton}>
            <Icon path={mdiAccountPlus} size={1} />
          </IconButton>
        </>
      );
    },
  },
];

export interface Props {
  appeal: TestAppeal;
}

const AppealDetailsExcluded = ({ appeal }: Props): ReactElement => {
  const classes = useStyles();

  const rows = appeal.excluded.map((contact, index) => ({
    id: index,
    contact: contact.name,
    reason: contact.reason,
    regularGiving: `${contact.regularGiving?.toFixed(2)} ${contact.currency} ${
      contact.frequency ? contact.frequency : ''
    }`,
  }));

  return (
    <>
      {appeal.excluded.length > 0 ? (
        <Box component="div" className={classes.container}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            disableSelectionOnClick
          />
        </Box>
      ) : (
        <AppealDetailsNoData />
      )}
    </>
  );
};

export default AppealDetailsExcluded;
