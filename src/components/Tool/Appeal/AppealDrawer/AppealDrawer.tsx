import React, { ReactElement } from 'react';
import { makeStyles, Drawer } from '@material-ui/core';
import theme from '../../../../theme';
import NavToolDrawerHandle from '../../NavToolList/NavToolDrawerHandle';
import AppealDrawerList from './AppealDrawerList';
//import { useAppealId } from '../../../../src/hooks/useAppealId';

const useStyles = makeStyles(() => ({
  drawer: {
    zIndex: 1,
  },
  navToggle: {
    backgroundColor: theme.palette.mpdxBlue.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.mpdxBlue.main,
    },
  },
  list: {
    width: '290px',
    transform: 'translateY(55px)',
    [theme.breakpoints.down('xs')]: {
      transform: 'translateY(45px)',
    },
  },
  li: {
    borderBottom: '1px solid',
    borderColor: theme.palette.cruGrayDark.main,
  },
}));

export interface Props {
  open: boolean;
  toggle: () => void;
  selectedId?: string;
}

const AppealDrawer = ({ open, toggle, selectedId }: Props): ReactElement => {
  const classes = useStyles();
  //const appealId = useAppealId();

  return (
    <>
      <Drawer
        anchor={'left'}
        open={open}
        onClose={toggle}
        variant="persistent"
        className={classes.drawer}
      >
        <AppealDrawerList selectedId={selectedId || ''} />
      </Drawer>
      <NavToolDrawerHandle open={open} toggle={toggle} />
    </>
  );
};

export default AppealDrawer;
