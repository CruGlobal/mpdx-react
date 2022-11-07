import React, { ReactElement } from 'react';
import { Theme, Drawer } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import NavToolDrawerHandle from './NavToolDrawerHandle';
import NavToolList from './NavToolList';

const useStyles = makeStyles()((theme: Theme) => ({
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
}));

export interface Props {
  open: boolean;
  toggle: () => void;
  selectedId?: string;
}

const NavToolDrawer = ({ open, toggle, selectedId }: Props): ReactElement => {
  const { classes } = useStyles();

  return (
    <>
      <Drawer
        anchor={'left'}
        open={open}
        onClose={toggle}
        variant="persistent"
        className={classes.drawer}
      >
        <NavToolList selectedId={selectedId || ''} />
      </Drawer>
      <NavToolDrawerHandle open={open} toggle={toggle} />
    </>
  );
};

export default NavToolDrawer;
