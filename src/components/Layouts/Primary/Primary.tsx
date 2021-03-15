import React, { ReactElement, ReactNode } from 'react';
import { Box, makeStyles, Theme, Hidden } from '@material-ui/core';
import AddFab from './AddFab';
import TopBar from './TopBar/TopBar';
import BottomBar from './BottomBar';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: '#f6f7f9',
    minHeight: 'calc(100vh - 122px)',
    [theme.breakpoints.down('xs')]: {
      minHeight: '100vh',
    },
  },
  box: {
    transition: theme.transitions.create('margin-left', {
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
  },
  addFabSpacer: {
    height: '100px',
  },
}));

interface Props {
  children: ReactNode;
}

const Primary = ({ children }: Props): ReactElement => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <Box className={classes.box}>
        <TopBar />
        {children}
      </Box>
      <Hidden smUp>
        <BottomBar />
      </Hidden>
      <AddFab />
      <Box className={classes.addFabSpacer}></Box>
    </Box>
  );
};

export default Primary;
