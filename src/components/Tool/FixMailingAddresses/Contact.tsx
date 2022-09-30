import React, { Fragment } from 'react';
import { Box, Grid, Button, Typography, Avatar, Hidden } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import { mdiCheckboxMarkedCircle, mdiLock, mdiPlus, mdiPencil } from '@mdi/js';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { DateTime } from 'luxon';
import theme from '../../../theme';
import { emptyAddress } from './FixMailingAddresses';
import { ContactAddressFragment } from './GetInvalidAddresses.generated';

const useStyles = makeStyles()(() => ({
  left: {
    [theme.breakpoints.up('lg')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  boxBottom: {
    backgroundColor: theme.palette.cruGrayLight.main,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(2),
    },
  },
  buttonTop: {
    padding: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(2),
    },
    '& .MuiButton-root': {
      backgroundColor: theme.palette.mpdxBlue.main,
      width: '100%',
      color: 'white',
      [theme.breakpoints.down('md')]: {
        width: '50%',
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  rowChangeResponsive: {
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      marginTop: -20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  responsiveBorder: {
    [theme.breakpoints.down('sm')]: {
      paddingBottom: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  paddingX: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  paddingY: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  paddingB2: {
    paddingBottom: theme.spacing(2),
  },
  address: {
    borderBottom: '1px solid gray',
    width: '100%',
    cursor: 'text',
  },
  hoverHighlight: {
    '&:hover': {
      color: theme.palette.mpdxBlue.main,
    },
  },
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
}));

interface Props {
  id?: string;
  name: string;
  status: string;
  addresses: ContactAddressFragment[];
  openFunction: (address: ContactAddressFragment) => void;
}

const Contact: React.FC<Props> = ({
  name,
  status,
  addresses,
  openFunction,
}) => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const newAddress = { ...emptyAddress, newAddress: true };
  //TODO: Add button functionality
  //TODO: Make contact name a link to contact page

  return (
    <Grid container className={classes.container}>
      <Grid container>
        <Grid item lg={10} xs={12}>
          <Box display="flex" alignItems="center" className={classes.left}>
            <Grid container>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  alignItems="center"
                  style={{ height: '100%' }}
                  p={2}
                >
                  <Avatar src="" className={classes.avatar} />
                  <Box display="flex" flexDirection="column" ml={2}>
                    <Typography variant="h6">{name}</Typography>
                    <Typography>{status}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} className={classes.boxBottom}>
                <Grid container>
                  <Hidden smDown>
                    <Grid item xs={12} md={6} className={classes.paddingY}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        className={classes.paddingX}
                      >
                        <Typography>
                          <strong>{t('Source')}</strong>
                        </Typography>
                        <Typography>
                          <strong>{t('Primary')}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} className={classes.paddingY}>
                      <Box
                        display="flex"
                        justifyContent="flex-start"
                        className={classes.paddingX}
                      >
                        <Typography>
                          <strong>{t('Address')}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  </Hidden>
                  {addresses.map((address) => (
                    <Fragment key={address.street}>
                      <Grid item xs={12} md={6} className={classes.paddingB2}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          className={classes.paddingX}
                        >
                          <Box>
                            <Hidden mdUp>
                              <Typography display="inline">
                                <strong>{t('Source')}: </strong>
                              </Typography>
                            </Hidden>
                            <Typography display="inline">
                              {address.source}{' '}
                            </Typography>
                            <Typography display="inline">
                              {DateTime.fromISO(
                                address.createdAt,
                              ).toLocaleString(DateTime.DATE_SHORT)}
                            </Typography>
                          </Box>
                          <Typography>
                            {address.primaryMailingAddress ? (
                              <StarIcon className={classes.hoverHighlight} />
                            ) : (
                              <StarOutlineIcon
                                className={classes.hoverHighlight}
                              />
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6} className={classes.paddingB2}>
                        <Box
                          display="flex"
                          justifyContent="flex-start"
                          className={clsx(
                            classes.responsiveBorder,
                            classes.paddingX,
                            classes.hoverHighlight,
                          )}
                        >
                          <Box
                            onClick={() => openFunction(address)}
                            className={classes.address}
                          >
                            <Typography>
                              {`${address.street}, ${address.city} ${
                                address.state ? address.state : ''
                              }. ${address.postalCode}`}
                            </Typography>
                          </Box>

                          <Icon
                            path={
                              address.source === 'MPDX' ? mdiPencil : mdiLock
                            }
                            size={1}
                          />
                        </Box>
                      </Grid>
                    </Fragment>
                  ))}
                  <Grid item xs={12} md={6} className={classes.paddingB2}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      className={classes.paddingX}
                    >
                      <Box>
                        <Hidden mdUp>
                          <Typography display="inline">
                            <strong>{t('Source')}: </strong>
                          </Typography>
                        </Hidden>
                        <Typography display="inline">MPDX</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6} className={classes.paddingB2}>
                    <Box
                      display="flex"
                      justifyContent="flex-start"
                      className={clsx(
                        classes.responsiveBorder,
                        classes.paddingX,
                        classes.hoverHighlight,
                      )}
                    >
                      <Box
                        onClick={() => openFunction(newAddress)}
                        className={classes.address}
                      />
                      <Icon path={mdiPlus} size={1} />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} lg={2}>
          <Box
            display="flex"
            flexDirection="column"
            style={{ paddingLeft: theme.spacing(1) }}
          >
            <Box className={classes.buttonTop}>
              <Button variant="contained">
                <Icon
                  path={mdiCheckboxMarkedCircle}
                  size={0.8}
                  className={classes.buttonIcon}
                />
                {t('Confirm')}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Contact;
