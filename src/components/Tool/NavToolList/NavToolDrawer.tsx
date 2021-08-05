import React from 'react';
import { makeStyles, Theme, Drawer } from '@material-ui/core';
import NavToolDrawerHandle from './NavToolDrawerHandle';
import NavToolList from './NavToolList';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    zIndex: 1,
  },
  list: {
    width: '290px',
    zIndex: '1 !important',
    transform: 'translateY(55px)',
    [theme.breakpoints.down('xs')]: {
      transform: 'translateY(45px)',
    },
  },
  navToggle: {
    backgroundColor: theme.palette.mpdxBlue.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.mpdxBlue.main,
    },
  },
  liButton: {
    '&:hover': {
      backgroundColor: theme.palette.cruGrayLight.main,
    },
  },
  li: {
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: theme.palette.cruGrayDark.main,
  },
}));

export interface Props {
  open: boolean;
  toggle: () => void;
}

const NavToolDrawer = ({ open, toggle }: Props): ReactElement => {
  const classes = useStyles();

  return (
    <>
      <Drawer
        anchor={'left'}
        open={open}
        onClose={toggle}
        variant="persistent"
        className={classes.drawer}
      >
        <NavToolList open={open} toggle={toggle} />
      </Drawer>
      <NavToolDrawerHandle open={open} toggle={toggle} />
    </>
  );
};

export default NavToolDrawer;
