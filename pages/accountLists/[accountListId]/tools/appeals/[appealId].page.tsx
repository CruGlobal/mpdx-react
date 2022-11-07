import React, { ReactElement, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Theme, Box, Container } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AppealDrawer from '../../../../../src/components/Tool/Appeal/AppealDrawer/AppealDrawer';
import { AppealProvider } from '../../../../../src/components/Tool/Appeal/AppealContextProvider/AppealContextProvider';

import AppealDetailsMain from '../../../../../src/components/Tool/Appeal/AppealDetails/AppealDetailsMain';
import { testAppeal2 } from './testAppeal';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    marginRight: theme.spacing(2),
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: theme.spacing(4),
      marginRight: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(5),
      marginRight: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(6),
    },
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    minWidth: '100vw',
  },
  loadingIndicator: {
    margin: theme.spacing(0, 1, 0, 0),
  },
}));

const AppealIdPage = (): ReactElement => {
  const { t } = useTranslation();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(true);
  const { classes } = useStyles();

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>MPDX | {t('Appeals')}</title>
      </Head>
      <AppealProvider>
        <Box className={classes.outer}>
          <AppealDrawer
            open={isNavListOpen}
            toggle={handleNavListToggle}
            appeal={testAppeal2}
          />
          <Container
            className={classes.container}
            style={{
              minWidth: isNavListOpen ? 'calc(97.5vw - 290px)' : '97.5vw',
              transition: 'min-width 0.15s linear',
            }}
          >
            <Box style={{ width: '100%' }}>
              <AppealDetailsMain appeal={testAppeal2} />
            </Box>
          </Container>
        </Box>
      </AppealProvider>
    </>
  );
};

export default AppealIdPage;
