import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import { makeStyles, Theme, Grid, Container, Box } from '@material-ui/core';
import { motion } from 'framer-motion';
import NavToolDrawer from '../../../../src/components/Tool/NavToolList/NavToolDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: 20,
    marginRight: 17,
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: 30,
      marginRight: 20,
    },
    [theme.breakpoints.down('md')]: {
      paddingLeft: 40,
      marginRight: 15,
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 45,
    },
  },
  outter: {
    display: 'flex',
    flexDirection: 'row',
    minWidth: '100vw',
  },
}));

const AppealsPage = (): ReactElement => {
  const { t } = useTranslation();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(true);
  const classes = useStyles();

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  const variants = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <Head>
        <title>MPDX | {t('Appeals')}</title>
      </Head>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
      >
        <Box className={classes.outter}>
          <NavToolDrawer
            open={isNavListOpen}
            toggle={handleNavListToggle}
            selectedId={'appeals'}
          />
          <Container
            className={classes.container}
            style={{
              //width: isNavListOpen ? 'calc(97.5vw - 290px)' : '97.5vw',
              minWidth: isNavListOpen ? 'calc(97.5vw - 290px)' : '97.5vw',
              transition: 'width 0.15s linear, min-width 0.15s linear',
            }}
          >
            <Grid container spacing={3}>
              <Grid
                item
                sm={12}
                md={6}
                style={{
                  border: '1px solid red',
                }}
              >
                <Box
                  style={{
                    border: '1px solid blue',
                  }}
                >
                  <h2>test1</h2>
                </Box>
              </Grid>
              <Grid item sm={12} md={6}>
                <Box>
                  <h2>test2</h2>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </motion.div>
    </>
  );
};

export default AppealsPage;
