import React, { Fragment, useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  Avatar,
  makeStyles,
  Hidden,
  TextField,
  Theme,
} from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import { mdiCheckboxMarkedCircle, mdiLock, mdiPlus, mdiDelete } from '@mdi/js';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';
import { PersonEmailAddressInput } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import { EmailAddressData } from './FixEmailAddresses';

const useStyles = makeStyles((theme: Theme) => ({
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
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1),
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
      cursor: 'pointer',
    },
  },
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
}));

export interface email {
  source: string;
  date: string;
  address: string;
  primary: boolean;
}

interface FixEmailAddressPersonProps {
  name: string;
  emails: EmailAddressData[];
  personId: string;
  toDelete: PersonEmailAddressInput[];
  handleChange: (
    personId: string,
    numberIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleDelete: (personId: string, emailAddress: number) => void;
  handleAdd: (personId: string, email: string) => void;
  handleChangePrimary: (personId: string, emailIndex: number) => void;
}

export const FixEmailAddressPerson: React.FC<FixEmailAddressPersonProps> = ({
  name,
  emails,
  personId,
  handleChange,
  handleDelete,
  handleAdd,
  handleChangePrimary,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [newEmailAddress, setNewEmailAddress] = useState<string>('');
  //TODO: Add button functionality
  //TODO: Make name pop up a modal to edit the person info

  const updateNewEmailAddress = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewEmailAddress(event.target.value);
  };

  const addNewEmailAddress = (): void => {
    if (newEmailAddress) {
      handleAdd(personId, newEmailAddress);
      setNewEmailAddress('');
    }
  };

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
                    <Typography variant="h6">{name}</Typography>
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
                  {emails.map((email, index) => (
                    <Fragment key={index}>
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
                              {`${email.source} (${email.updatedAt})`}
                            </Typography>
                          </Box>
                          <Typography>
                            {email.primary ? (
                              <StarIcon
                                data-testid={`starIcon-${personId}-${index}`}
                                className={classes.hoverHighlight}
                              />
                            ) : (
                              <StarOutlineIcon
                                data-testid={`starOutlineIcon-${personId}-${index}`}
                                className={classes.hoverHighlight}
                                onClick={() =>
                                  handleChangePrimary(personId, index)
                                }
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
                          )}
                        >
                          <TextField
                            style={{ width: '100%' }}
                            inputProps={{
                              'data-testid': `textfield-${personId}-${index}`,
                            }}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>,
                            ) => handleChange(personId, index, event)}
                            value={email.email}
                            disabled={email.source !== 'MPDX'}
                          />

                          {email.source === 'MPDX' ? (
                            <Box
                              data-testid={`delete-${personId}-${index}`}
                              onClick={() => handleDelete(personId, index)}
                            >
                              <Icon
                                path={mdiDelete}
                                size={1}
                                className={classes.hoverHighlight}
                              />
                            </Box>
                          ) : (
                            <Icon
                              path={mdiLock}
                              size={1}
                              style={{
                                color: theme.palette.cruGrayMedium.main,
                              }}
                            />
                          )}
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
                      )}
                    >
                      <TextField
                        style={{ width: '100%' }}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => updateNewEmailAddress(event)}
                        inputProps={{
                          'data-testid': `addNewEmailInput-${personId}`,
                        }}
                        value={newEmailAddress}
                      />
                      <Box
                        onClick={() => addNewEmailAddress()}
                        data-testid={`addButton-${personId}`}
                      >
                        <Icon
                          path={mdiPlus}
                          size={1}
                          className={classes.hoverHighlight}
                        />
                      </Box>
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
                {t('Confirm')}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};
