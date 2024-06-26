import React, { useContext } from 'react';
import { Box, Theme } from '@mui/material';
import { Container } from '@mui/system';
import { makeStyles } from 'tss-react/mui';
import { testAppeal2 } from 'pages/accountLists/[accountListId]/tools/appeals/testAppeal';
import AppealDetailsMain from './AppealDetails/AppealDetailsMain';
import AppealDrawer from './AppealDrawer/AppealDrawer';
import { AppealsContext, AppealsType } from './ContactsContext/AppealsContext';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    padding: `${theme.spacing(3)} ${theme.spacing(3)} 0`,
    display: 'flex',
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  loadingIndicator: {
    margin: theme.spacing(0, 1, 0, 0),
  },
}));

const AppealsDetailsPage: React.FC = () => {
  const { classes } = useStyles();

  const { filterPanelOpen, setFilterPanelOpen } = useContext(
    AppealsContext,
  ) as AppealsType;

  const handleNavListToggle = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  return (
    <Box className={classes.outer}>
      <AppealDrawer
        open={filterPanelOpen}
        toggle={handleNavListToggle}
        appeal={testAppeal2}
      />
      <Container
        className={classes.container}
        style={{
          minWidth: filterPanelOpen ? 'calc(97.5vw - 290px)' : '97.5vw',
          transition: 'min-width 0.15s linear',
        }}
      >
        <Box style={{ width: '100%' }}>
          <AppealDetailsMain appeal={testAppeal2} />
        </Box>
      </Container>
    </Box>
  );
};

export default AppealsDetailsPage;
