import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import {
  makeStyles,
  Theme,
  Grid,
  Container,
  Box,
  Typography,
  Divider,
  CircularProgress,
} from '@material-ui/core';
import { motion } from 'framer-motion';
import NavToolDrawer from '../../../../src/components/Tool/NavToolList/NavToolDrawer';
import Appeal from '../../../../src/components/Tool/Appeal/Appeal';
import Appeals from '../../../../src/components/Tool/Appeal/Appeals';
import { useGetPrimaryAppealQuery } from '../../../../pages/accountLists/[accountListId]/tools/GetPrimaryAppeal.generated';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

import AddAppealForm from '../../../../src/components/Tool/Appeal/AddAppealForm';
import NoAppeals from 'src/components/Tool/Appeal/NoAppeals';

const useStyles = makeStyles((theme: Theme) => ({
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

const AppealsPage = (): ReactElement => {
  const { t } = useTranslation();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(true);
  const classes = useStyles();
  const accountListId = useAccountListId();
  const { data, loading } = useGetPrimaryAppealQuery({
    variables: { id: accountListId || '' },
  });

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
        <Box className={classes.outer}>
          <NavToolDrawer
            open={isNavListOpen}
            toggle={handleNavListToggle}
            selectedId={'appeals'}
          />
          <Container
            className={classes.container}
            style={{
              minWidth: isNavListOpen ? 'calc(97.5vw - 290px)' : '97.5vw',
              transition: 'min-width 0.15s linear',
            }}
          >
            <Grid container spacing={3}>
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

              <Grid item xs={12} sm={12} md={6}>
                {loading ? (
                  <Box display="flex" justifyContent="center" mt={10}>
                    <CircularProgress
                      color="primary"
                      size={40}
                      className={classes.loadingIndicator}
                    />
                  </Box>
                ) : (
                  data && (
                    <>
                      <Box m={1}>
                        <Typography variant="h6">
                          {t('Primary Appeal')}
                        </Typography>
                      </Box>
                      <Divider />
                      {data.accountList.primaryAppeal ? (
                        <Appeal
                          name={data.accountList.primaryAppeal.name || ''}
                          primary
                          amount={data.accountList.primaryAppeal.amount || 0}
                          amountCurrency={
                            data.accountList.primaryAppeal.amountCurrency
                          }
                          given={
                            data.accountList.primaryAppeal
                              .pledgesAmountProcessed || 0
                          }
                          received={
                            data.accountList.primaryAppeal
                              .pledgesAmountReceivedNotProcessed || 0
                          }
                          commited={
                            data.accountList.primaryAppeal
                              .pledgesAmountNotReceivedNotProcessed || 0
                          }
                          total={
                            data.accountList.primaryAppeal.pledgesAmountTotal ||
                            0
                          }
                        />
                      ) : (
                        <NoAppeals primary />
                      )}
                      <Divider />
                      <Appeals
                        primaryId={
                          data.accountList.primaryAppeal
                            ? data.accountList.primaryAppeal.id
                            : ''
                        }
                      />
                    </>
                  )
                )}
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <Box>
                  <AddAppealForm />
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
