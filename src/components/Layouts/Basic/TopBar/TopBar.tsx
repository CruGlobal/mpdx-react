import React, { ReactElement, ReactNode } from 'react';
import {
  makeStyles,
  Toolbar,
  AppBar,
  useScrollTrigger,
  Theme,
  Grid,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    paddingTop: `env(safe-area-inset-top)`,
    paddingLeft: `env(safe-area-inset-left)`,
    paddingRight: `env(safe-area-inset-right)`,
    backgroundColor: theme.palette.mpdxBlue.main,
  },
  toolbar: {
    backgroundColor: theme.palette.mpdxBlue.main,
  },
  container: {
    minHeight: '48px',
  },
}));

interface Props {
  children?: ReactNode;
}

const TopBar = ({ children }: Props): ReactElement => {
  const classes = useStyles();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <>
      <AppBar className={classes.appBar} elevation={trigger ? 3 : 0}>
        <Toolbar className={classes.toolbar}>
          <Grid container className={classes.container} alignItems="center">
            {children}
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar position="static" className={classes.appBar} elevation={0}>
        <Toolbar className={classes.toolbar}>
          <Grid className={classes.container} />
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopBar;
