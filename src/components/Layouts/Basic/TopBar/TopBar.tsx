import React, { ReactElement, ReactNode } from 'react';
import { AppBar, Grid, Theme, Toolbar, useScrollTrigger } from '@mui/material';
import { styled } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
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

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

interface Props {
  children?: ReactNode;
}

const TopBar = ({ children }: Props): ReactElement => {
  const { classes } = useStyles();

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
      <Offset />
    </>
  );
};

export default TopBar;
