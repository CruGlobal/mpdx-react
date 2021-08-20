import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  Box,
  Theme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';
import Icon from '@mdi/react';
import { mdiTrophy } from '@mdi/js';
import { useAppealContext } from '../AppealContextProvider/AppealContextProvider';
import { AppealDrawerItem } from './Item/AppealDrawerItem';
import { AppealDrawerItemButton } from './Item/AppealDrawerItemButton';

const useStyles = makeStyles((theme: Theme) => ({
  list: {
    width: '290px',
    transform: 'translateY(55px)',
    [theme.breakpoints.down('xs')]: {
      transform: 'translateY(45px)',
    },
  },
  li: {
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: theme.palette.cruGrayDark.main,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  header: {
    fontSize: '1.5em',
  },
}));

const AppealDrawerList = (): ReactElement => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { appealState } = useAppealContext();

  const testFunc = (): void => {
    console.log('Test success!');
  };

  return (
    <Box component="div" className={classes.list}>
      <List>
        <ListItem className={classes.li}>
          <ListItemIcon>
            <Icon path={mdiTrophy} size={1.5} />
          </ListItemIcon>
          <ListItemText
            classes={{ primary: classes.header }}
            primary={t('Appeals')}
          />
        </ListItem>
        <AppealDrawerItem
          id="given"
          title="Given"
          value={0}
          isSelected={appealState.subDisplay === 'given'}
        />
        <AppealDrawerItem
          id="received"
          title="Received"
          value={2}
          isSelected={appealState.subDisplay === 'received'}
        />
        <AppealDrawerItem
          id="asked"
          title="Asked"
          value={75}
          isSelected={appealState.subDisplay === 'asked'}
        />
        <AppealDrawerItem
          id="excluded"
          title="Excluded"
          value={1000}
          isSelected={appealState.subDisplay === 'excluded'}
        />
        <AppealDrawerItemButton
          title="Export to CSV"
          func={testFunc}
          buttonText={`Export ${appealState.selected.length} Selected`}
        />
        <AppealDrawerItemButton
          title="Export Emails"
          func={testFunc}
          buttonText={`Export ${appealState.selected.length} Selected`}
        />
        <AppealDrawerItemButton
          title="Add Contact to Appeal"
          func={testFunc}
          buttonText={`Select Contact`}
        />
        <AppealDrawerItemButton
          title="Delete Appeal"
          func={testFunc}
          buttonText={`Permanently Delete Appeal`}
        />
      </List>
    </Box>
  );
};

export default AppealDrawerList;
