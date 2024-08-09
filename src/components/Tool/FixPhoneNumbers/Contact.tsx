import React, { Fragment, useState } from 'react';
import styled from '@emotion/styled';
import { mdiCheckboxMarkedCircle, mdiDelete, mdiLock, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  Hidden,
  Link,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { PersonPhoneNumberInput } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import theme from '../../../theme';
import { PhoneNumberData } from './FixPhoneNumbers';

const useStyles = makeStyles()((theme: Theme) => ({
  left: {},
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  boxBottom: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      paddingTop: theme.spacing(2),
    },
  },
  contactCard: {
    marginBottom: theme.spacing(2),
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
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  paddingB2: {
    paddingBottom: theme.spacing(1),
  },
  hoverHighlight: {
    '&:hover': {
      color: theme.palette.mpdxBlue.main,
      cursor: 'pointer',
    },
  },
}));

const ContactHeader = styled(CardHeader)(() => ({
  '.MuiCardHeader-action': {
    alignSelf: 'center',
  },
}));

const ContactAvatar = styled(Avatar)(() => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
}));

interface Props {
  name: string;
  numbers: PhoneNumberData[];
  toDelete: PersonPhoneNumberInput[];
  personId: string;
  handleChange: (
    personId: string,
    numberIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleDelete: (personId: string, phoneNumber: number) => void;
  handleAdd: (personId: string, number: string) => void;
  handleChangePrimary: (personId: string, numberIndex: number) => void;
  setContactFocus: SetContactFocus;
  avatar: string;
  handleUpdate: (
    personId: string,
    name: string,
    numbers: PhoneNumberData[],
  ) => void;
}

const Contact: React.FC<Props> = ({
  name,
  numbers,
  personId,
  handleChange,
  handleDelete,
  handleAdd,
  handleChangePrimary,
  // Remove below line when function is being used.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setContactFocus,
  avatar,
  handleUpdate,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { classes } = useStyles();
  const [newPhoneNumber, setNewPhoneNumber] = useState<string>('');
  //TODO: Add button functionality
  //TODO: Make name pop up a modal to edit the person info

  const updateNewPhoneNumber = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewPhoneNumber(event.target.value);
  };

  const addNewPhoneNumber = (): void => {
    if (newPhoneNumber) {
      handleAdd(personId, newPhoneNumber);
      setNewPhoneNumber('');
    }
  };

  const handleContactNameClick = () => {
    // This currently doesn't work as we need to add the contactId onto the person graphQL endpoint.
    // I've asked Andrew to add it here: https://cru-main.slack.com/archives/CG47BDCG6/p1718721024211409
    // You'll need that to run the below function
    // setContactFocus(id);
  };

  return (
    <Grid container className={classes.container}>
      <Grid container>
        <Card className={classes.contactCard}>
          <Box display="flex" alignItems="center" className={classes.left}>
            <Grid container>
              <Grid item xs={12}>
                <ContactHeader
                  avatar={
                    <ContactAvatar
                      src={avatar || ''}
                      aria-label="Contact Avatar"
                      onClick={handleContactNameClick}
                    />
                  }
                  title={
                    <Link underline="hover" onClick={handleContactNameClick}>
                      <Typography variant="subtitle1">{name}</Typography>
                    </Link>
                  }
                  action={
                    <Button
                      data-testid={`confirmButton-${personId}`}
                      onClick={() => handleUpdate(personId, name, numbers)}
                      variant="contained"
                      style={{ width: '100%' }}
                    >
                      <Icon
                        path={mdiCheckboxMarkedCircle}
                        size={0.8}
                        className={classes.buttonIcon}
                      />
                      {t('Confirm')}
                    </Button>
                  }
                ></ContactHeader>
              </Grid>

              <CardContent className={(classes.paddingX, classes.paddingY)}>
                <Grid container display="flex" alignItems="center">
                  <Hidden xsDown>
                    <Grid item xs={12} sm={6} className={classes.paddingY}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        className={classes.paddingX}
                      >
                        <Typography variant="body2">
                          <strong>{t('Source')}</strong>
                        </Typography>
                        <Typography variant="body2">
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
                        <Typography variant="body2">
                          <strong>{t('Phone Number')}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  </Hidden>
                  {numbers.map((phoneNumber, index) => (
                    <Fragment key={index}>
                      <Grid item xs={12} sm={6} className={classes.paddingB2}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          className={classes.paddingX}
                        >
                          <Box>
                            <Hidden smUp>
                              <Typography display="inline" variant="body2">
                                <strong>{t('Source')}: </strong>
                              </Typography>
                            </Hidden>
                            <Typography display="inline" variant="body2">
                              {`${phoneNumber.source} (${dateFormatShort(
                                DateTime.fromISO(phoneNumber.updatedAt),
                                locale,
                              )})`}
                            </Typography>
                          </Box>
                          <Typography>
                            {phoneNumber.primary ? (
                              <StarIcon
                                data-testid={`starIcon-${personId}-${index}`}
                                className={classes.hoverHighlight}
                              />
                            ) : (
                              <Tooltip title="Set as Primary">
                                <StarOutlineIcon
                                  data-testid={`starOutlineIcon-${personId}-${index}`}
                                  className={classes.hoverHighlight}
                                  onClick={() =>
                                    handleChangePrimary(personId, index)
                                  }
                                />
                              </Tooltip>
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
                          <FormControl fullWidth>
                            <TextField
                              style={{ width: '100%' }}
                              size="small"
                              inputProps={{
                                'data-testid': `textfield-${personId}-${index}`,
                              }}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>,
                              ) => handleChange(personId, index, event)}
                              value={phoneNumber.number}
                              disabled={phoneNumber.source !== 'MPDX'}
                            />
                          </FormControl>

                          {phoneNumber.source === 'MPDX' ? (
                            <Box
                              display="flex"
                              alignItems="center"
                              data-testid={`delete-${personId}-${index}`}
                              onClick={() => handleDelete(personId, index)}
                              className={classes.paddingX}
                            >
                              <Tooltip title="Delete Number">
                                <Icon
                                  path={mdiDelete}
                                  size={1}
                                  className={classes.hoverHighlight}
                                />
                              </Tooltip>
                            </Box>
                          ) : (
                            <Box
                              display="flex"
                              alignItems="center"
                              data-testid={`lock-${personId}-${index}`}
                              className={classes.paddingX}
                            >
                              <Icon
                                path={mdiLock}
                                size={1}
                                style={{
                                  color: theme.palette.cruGrayMedium.main,
                                }}
                              />
                            </Box>
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
                          <Typography display="inline" variant="body2">
                            <strong>{t('Source')}: </strong>
                          </Typography>
                        </Hidden>
                        <Typography display="inline" variant="body2">
                          MPDX
                        </Typography>
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
                      <FormControl fullWidth>
                        <TextField
                          style={{ width: '100%' }}
                          size="small"
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ) => updateNewPhoneNumber(event)}
                          inputProps={{
                            'data-testid': `addNewNumberInput-${personId}`,
                          }}
                          value={newPhoneNumber}
                        />
                      </FormControl>
                      <Box
                        className={classes.paddingX}
                        display="flex"
                        alignItems="center"
                        onClick={() => addNewPhoneNumber()}
                        data-testid={`addButton-${personId}`}
                      >
                        <Tooltip title="Add Number">
                          <Icon
                            path={mdiPlus}
                            size={1}
                            className={classes.hoverHighlight}
                          />
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Grid>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Contact;
