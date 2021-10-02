import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import {
  makeStyles,
  Theme,
  Grid,
  Box,
  Typography,
  Divider,
} from '@material-ui/core';
import { motion } from 'framer-motion';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import Appeals from '../../../../src/components/Tool/Appeal/Appeals';

import AddAppealForm from '../../../../src/components/Tool/Appeal/AddAppealForm';
import Loading from '../../../../src/components/Loading';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    width: '70%',
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
      width: '90%',
    },
    [theme.breakpoints.down('md')]: {
      width: '70%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
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

const AppealsPage: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const accountListId = useAccountListId();

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
      {accountListId ? (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
        >
          <Box className={classes.outer}>
            <Grid container spacing={3} className={classes.container}>
              <Grid item xs={12}>
                <Box m={1}>
                  <Typography variant="h4">{t('Appeals')}</Typography>
                </Box>
                <Divider />
                <Box m={1}>
                  <Typography variant="body2">
                    {t(
                      'You can track recurring support goals or special need ' +
                        'support goals through our appeals wizard. Track the ' +
                        'recurring support you raise for an increase ask for example, ' +
                        'or special gifts you raise for a summer mission trip or your ' +
                        'new staff special gift goal.',
                    )}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={12} lg={6}>
                <Appeals accountListId={accountListId} />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <Box width="100%" display="flex" justifyContent="center">
                  <AddAppealForm />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default AppealsPage;
