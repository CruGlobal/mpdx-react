import React, { ReactElement, ReactNode, useState } from 'react';
import { Hidden, Theme, makeStyles } from '@material-ui/core';
import AddFab from './AddFab';
import TopBar from './TopBar/TopBar';
import BottomBar from './BottomBar';
import { NavReportsList } from 'src/components/Reports/ReportLayout/NavReportsList/NavReportsList';
import { NavBar } from 'src/components/Layouts/Primary/NavBar/NavBar';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.common.white,
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  wrapper: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
    paddingTop: 60,
    [theme.breakpoints.up('lg')]: {
      paddingLeft: 290,
    },
  },
  contentContainer: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
  content: {
    flex: '1 1 auto',
    height: '100%',
    overflow: 'auto',
  },
}));

interface Props {
  children: ReactNode;
}

const Primary = ({ children }: Props): ReactElement => {
  const classes = useStyles();
  const [isMobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  return (
    <>
      <div className={classes.root}>
        <TopBar onMobileNavOpen={() => setMobileNavOpen(true)} />
        <NavBar
          onMobileClose={() => setMobileNavOpen(false)}
          openMobile={isMobileNavOpen}
        >
          <NavReportsList selected="salaryCurrency" />
        </NavBar>
        <div className={classes.wrapper}>
          <div className={classes.contentContainer}>
            <div className={classes.content}>{children}</div>
          </div>
        </div>
      </div>
      <Hidden mdUp>
        <BottomBar />
      </Hidden>
      <AddFab />
    </>
  );
};

export default Primary;
