import React, { Fragment, ReactElement } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  Avatar,
  makeStyles,
  Hidden,
} from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import { mdiCheckboxMarkedCircle, mdiLock, mdiPlus, mdiPencil } from '@mdi/js';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';
import theme from '../../../theme';

const useStyles = makeStyles(() => ({
  left: {
    [theme.breakpoints.up('md')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  boxBottom: {
    backgroundColor: theme.palette.cruGrayLight.main,
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      paddingTop: theme.spacing(2),
    },
  },
  buttonTop: {
    margin: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    '& .MuiButton-root': {
      backgroundColor: theme.palette.mpdxBlue.main,
      color: 'white',
    },
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  rowChangeResponsive: {
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      marginTop: -20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  responsiveBorder: {
    [theme.breakpoints.down('xs')]: {
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

export interface address {
  source: string;
  street: string;
  locationType: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  region?: string;
  metro?: string;
  primary: boolean;
  valid: boolean;
}

interface Props {
  title: string;
  tag: string;
  addresses: address[];
  openFunction: (address) => void;
}

const Contact = ({
  title,
  tag,
  addresses,
  openFunction,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const classes = useStyles();

  //TODO: Add button functionality
  //TODO: Mkae contact title a link to contact page

  return (
    <Grid container className={classes.container}>
      <Grid container>
        <Grid item md={10} xs={12}>
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
                    <Typography variant="h6">{title}</Typography>
                    <Typography>{tag}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} className={classes.boxBottom}>
                <Grid container>
                  <Hidden xsDown>
                    <Grid item xs={12} sm={6} className={classes.paddingY}>
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
                    <Grid item xs={12} sm={6} className={classes.paddingY}>
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
                      <Grid item xs={12} sm={6} className={classes.paddingB2}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          className={classes.paddingX}
                        >
                          <Box>
                            <Hidden smUp>
                              <Typography display="inline">
                                <strong>{t('Source')}: </strong>
                              </Typography>
                            </Hidden>
                            <Typography display="inline">
                              {address.source}
                            </Typography>
                          </Box>
                          <Typography>
                            {address.primary ? (
                              <StarIcon className={classes.hoverHighlight} />
                            ) : (
                              <StarOutlineIcon
                                className={classes.hoverHighlight}
                              />
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} className={classes.paddingB2}>
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
                              }. ${address.zip}`}
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
                  <Grid item xs={12} sm={6} className={classes.paddingB2}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      className={classes.paddingX}
                    >
                      <Box>
                        <Hidden smUp>
                          <Typography display="inline">
                            <strong>{t('Source')}: </strong>
                          </Typography>
                        </Hidden>
                        <Typography display="inline">MPDX</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} className={classes.paddingB2}>
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
                        onClick={() => openFunction(null)}
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
        <Grid item xs={12} md={2}>
          <Box
            display="flex"
            flexDirection="column"
            style={{ paddingLeft: theme.spacing(1) }}
          >
            <Box className={classes.buttonTop}>
              <Button variant="contained" style={{ width: '100%' }}>
                <Icon
                  path={mdiCheckboxMarkedCircle}
                  size={0.8}
                  className={classes.buttonIcon}
                />
                Confirm
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Contact;
