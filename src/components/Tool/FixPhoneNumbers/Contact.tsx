import React, { Fragment } from 'react';
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
  FormHelperText,
  Grid,
  Hidden,
  Link,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { FormikErrors } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import theme from '../../../theme';
import { FormValues, FormValuesPerson } from './FixPhoneNumbers';
import {
  PersonInvalidNumberFragment,
  PersonPhoneNumberFragment,
} from './GetInvalidPhoneNumbers.generated';

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
  handleDelete: (
    personIndex: number,
    numberIndex: number,
    phoneNumber: string,
  ) => void;
  setContactFocus: SetContactFocus;
  handleUpdate: (
    values: FormValues,
    personId: string,
    personIndex: number,
    name: string,
  ) => void;
  errors: FormikErrors<any>;
  setValues: (values: FormValues) => void;
  values: FormValues;
  person: PersonInvalidNumberFragment;
  personIndex: number;
}

const Contact: React.FC<Props> = ({
  handleDelete,
  // Remove below line when function is being used.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setContactFocus,
  handleUpdate,
  errors,
  setValues,
  values,
  person,
  personIndex,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { classes } = useStyles();
  const { appName } = useGetAppSettings();

  const numbers: PersonPhoneNumberFragment[] = person.phoneNumbers.nodes || [];
  const name: string = `${person.firstName} ${person.lastName}`;

  //TODO: Add button functionality
  //TODO: Make name pop up a modal to edit the person info

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
                      src={person?.avatar || ''}
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
                      data-testid={`confirmButton-${person.id}`}
                      onClick={() =>
                        handleUpdate(values, person.id, personIndex, name)
                      }
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
                  <Hidden smDown>
                    <Grid item xs={6} sm={4} className={classes.paddingY}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        className={classes.paddingX}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {t('Source')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={2} className={classes.paddingY}>
                      <Box
                        display="flex"
                        justifyContent="center"
                        className={classes.paddingX}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {t('Primary')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.paddingY}>
                      <Box
                        display="flex"
                        justifyContent="flex-start"
                        className={classes.paddingX}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {t('Phone Number')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Hidden>
                  {numbers.map((phoneNumber, index) => (
                    <Fragment key={index}>
                      <Grid item xs={6} sm={4} className={classes.paddingB2}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          className={classes.paddingX}
                        >
                          <Box>
                            <Hidden smUp>
                              <Typography
                                display="inline"
                                variant="body2"
                                fontWeight="bold"
                              >
                                {t('Source')}:
                              </Typography>
                            </Hidden>
                            <Typography display="inline" variant="body2">
                              {`${phoneNumber.source} (${dateFormatShort(
                                DateTime.fromISO(phoneNumber.updatedAt),
                                locale,
                              )})`}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={2} className={classes.paddingB2}>
                        <Box
                          display="flex"
                          justifyContent="center"
                          className={classes.paddingX}
                        >
                          <Typography display="flex" alignItems="center">
                            {phoneNumber.primary ? (
                              <>
                                <Hidden smUp>
                                  <Typography
                                    display="inline"
                                    variant="body2"
                                    fontWeight="bold"
                                  >
                                    {t('Source')}:
                                  </Typography>
                                </Hidden>
                                <StarIcon
                                  data-testid={`starIcon-${person.id}-${index}`}
                                  className={classes.hoverHighlight}
                                />
                              </>
                            ) : (
                              <>
                                <Hidden smUp>
                                  <Typography
                                    display="inline"
                                    variant="body2"
                                    fontWeight="bold"
                                  >
                                    {t('Source')}:
                                  </Typography>
                                </Hidden>
                                <Tooltip title="Set as Primary">
                                  <StarOutlineIcon
                                    data-testid={`starOutlineIcon-${person.id}-${index}`}
                                    className={classes.hoverHighlight}
                                    onClick={() => {
                                      const updatedValues = {
                                        people: values.people.map(
                                          (personValue: FormValuesPerson) =>
                                            personValue === person
                                              ? {
                                                  ...personValue,
                                                  phoneNumbers: {
                                                    nodes: numbers.map(
                                                      (
                                                        number: PersonPhoneNumberFragment,
                                                      ) => ({
                                                        ...number,
                                                        primary:
                                                          number ===
                                                          phoneNumber,
                                                      }),
                                                    ),
                                                  },
                                                }
                                              : personValue,
                                        ),
                                      };
                                      setValues(updatedValues);
                                    }}
                                  />
                                </Tooltip>
                              </>
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
                                'data-testid': `textfield-${person.id}-${index}`,
                              }}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>,
                              ) => {
                                const updatedValues = {
                                  people: values.people.map(
                                    (personValue: FormValuesPerson) =>
                                      personValue === person
                                        ? {
                                            ...personValue,
                                            phoneNumbers: {
                                              nodes: numbers.map(
                                                (
                                                  number: PersonPhoneNumberFragment,
                                                ) => ({
                                                  ...number,
                                                  number:
                                                    number === phoneNumber
                                                      ? event.target.value
                                                      : number.number,
                                                }),
                                              ),
                                            },
                                          }
                                        : personValue,
                                  ),
                                };
                                setValues(updatedValues);
                              }}
                              value={phoneNumber.number}
                              disabled={phoneNumber.source !== 'MPDX'}
                            />
                            <FormHelperText error={true}>
                              {
                                errors?.people?.[personIndex]?.phoneNumbers
                                  ?.nodes?.[index]?.number
                              }
                            </FormHelperText>
                          </FormControl>

                          {phoneNumber.source === 'MPDX' ? (
                            <Box
                              display="flex"
                              alignItems="center"
                              data-testid={`delete-${person.id}-${index}`}
                              onClick={() =>
                                handleDelete(
                                  personIndex,
                                  index,
                                  phoneNumber.number || '',
                                )
                              }
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
                              data-testid={`lock-${person.id}-${index}`}
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
                          <Typography
                            display="inline"
                            variant="body2"
                            fontWeight="bold"
                          >
                            {t('Source')}:
                          </Typography>
                        </Hidden>
                        <Typography display="inline" variant="body2">
                          {appName}
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
                          ) => {
                            const updatedValues = {
                              people: values.people.map(
                                (personValue: FormValuesPerson) =>
                                  personValue === person
                                    ? {
                                        ...personValue,
                                        isNewPhoneNumber: true,
                                        newPhoneNumber: event.target.value,
                                      }
                                    : personValue,
                              ),
                            };
                            setValues(updatedValues);
                          }}
                          inputProps={{
                            'data-testid': `addNewNumberInput-${person.id}`,
                          }}
                          value={values.people[personIndex].newPhoneNumber}
                        />
                        <FormHelperText error={true}>
                          {errors?.people?.[personIndex]?.newPhoneNumber}
                        </FormHelperText>
                      </FormControl>
                      <Box
                        className={classes.paddingX}
                        display="flex"
                        alignItems="center"
                        onClick={() => {
                          const updatedValues = {
                            people: values.people.map(
                              (personValue: PersonInvalidNumberFragment) =>
                                personValue === person
                                  ? {
                                      ...person,
                                      phoneNumbers: {
                                        nodes: [
                                          ...person.phoneNumbers.nodes,
                                          {
                                            updatedAt: DateTime.local().toISO(),
                                            primary: false,
                                            source: appName,
                                            number:
                                              values.people[personIndex]
                                                .newPhoneNumber,
                                          },
                                        ],
                                      },
                                      isNewPhoneNumber: false,
                                      newPhoneNumber: '',
                                    }
                                  : personValue,
                            ),
                          };
                          setValues(updatedValues as FormValues);
                        }}
                        data-testid={`addButton-${person.id}`}
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
