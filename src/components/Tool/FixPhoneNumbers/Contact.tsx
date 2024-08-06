import React, { Fragment, ReactElement } from 'react';
import { mdiCheckboxMarkedCircle, mdiDelete, mdiLock, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import {
  Avatar,
  Box,
  Button,
  FormHelperText,
  Grid,
  Hidden,
  Link,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { Field, Form, Formik } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { PersonPhoneNumberInput } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import theme from '../../../theme';
import { PhoneNumberData } from './FixPhoneNumbers';

const useStyles = makeStyles()((theme: Theme) => ({
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

interface Props {
  name: string;
  numbers: PhoneNumberData[];
  toDelete: PersonPhoneNumberInput[];
  personId: string;
  handleChange: (personId: string, number: PhoneNumberData[]) => void;
  setContactFocus: SetContactFocus;
}

const Contact: React.FC<Props> = ({
  name,
  numbers,
  personId,
  handleChange,
  // Remove below line when function is being used.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setContactFocus,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { classes } = useStyles();
  // const [newPhoneNumber, setNewPhoneNumber] = useState<string>('');
  //TODO: Add button functionality

  const handleContactNameClick = () => {
    // This currently doesn't work as we need to add the contactId onto the person graphQL endpoint.
    // I've asked Andrew to add it here: https://cru-main.slack.com/archives/CG47BDCG6/p1718721024211409
    // You'll need that to run the below function
    // setContactFocus(id);
  };

  const phoneRegExp =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const appealFormSchema = yup.object({
    phoneNums: yup.array().of(
      yup.object({
        id: yup.string(),
        number: yup.string().matches(phoneRegExp, 'Phone number is not valid'),
        primary: yup.boolean(),
        source: yup.string(),
        updatedAt: yup.string(),
      }),
    ),
    newPhoneNumber: yup
      .string()
      .matches(phoneRegExp, 'Phone number is not valid'),
  });

  return (
    <Grid container className={classes.container}>
      <Formik
        initialValues={{ phoneNums: numbers, newPhoneNumber: '' }}
        enableReinitialize={true}
        validationSchema={appealFormSchema}
        onSubmit={(values) => {
          handleChange(personId, values.phoneNums);
        }}
      >
        {({
          values: { phoneNums, newPhoneNumber },
          setFieldValue,
          errors,
          setValues,
        }): ReactElement => {
          return (
            <Form>
              <Grid container>
                <Grid item md={10} xs={12}>
                  <Box
                    display="flex"
                    alignItems="center"
                    className={classes.left}
                  >
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
                            <Link
                              underline="hover"
                              onClick={handleContactNameClick}
                            >
                              <Typography variant="h6">{name}</Typography>
                            </Link>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} className={classes.boxBottom}>
                        <Grid container>
                          <Hidden xsDown>
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              className={classes.paddingY}
                            >
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
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              className={classes.paddingY}
                            >
                              <Box
                                display="flex"
                                justifyContent="flex-start"
                                className={classes.paddingX}
                              >
                                <Typography>
                                  <strong>{t('Phone Number')}</strong>
                                </Typography>
                              </Box>
                            </Grid>
                          </Hidden>
                          {phoneNums.map((phoneNum, index) => (
                            <Fragment key={index}>
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                className={classes.paddingB2}
                              >
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
                                      {`${phoneNum.source} (${dateFormatShort(
                                        DateTime.fromISO(phoneNum.updatedAt),
                                        locale,
                                      )})`}
                                    </Typography>
                                  </Box>
                                  <Typography>
                                    {phoneNum.primary ? (
                                      <StarIcon
                                        data-testid={`starIcon-${personId}-${index}`}
                                        className={classes.hoverHighlight}
                                      />
                                    ) : (
                                      <StarOutlineIcon
                                        data-testid={`starOutlineIcon-${personId}-${index}`}
                                        className={classes.hoverHighlight}
                                        onClick={() => {
                                          phoneNums.map((n) => {
                                            if (n.primary) {
                                              setFieldValue(
                                                `phoneNums[${phoneNums.indexOf(
                                                  n,
                                                )}].primary`,
                                                false,
                                              );
                                            }
                                          });
                                          setFieldValue(
                                            `phoneNums[${index}].primary`,
                                            !phoneNum.primary,
                                          );
                                        }}
                                      />
                                    )}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                className={classes.paddingB2}
                              >
                                <Box
                                  display="flex"
                                  justifyContent="flex-start"
                                  className={clsx(
                                    classes.responsiveBorder,
                                    classes.paddingX,
                                  )}
                                >
                                  <Field
                                    as={TextField}
                                    style={{ width: '100%' }}
                                    inputProps={{
                                      'data-testid': `textfield-${personId}-${index}`,
                                    }}
                                    onChange={(e) =>
                                      setFieldValue(
                                        `phoneNums[${index}].number`,
                                        e.target.value,
                                      )
                                    }
                                    value={phoneNum.number}
                                    disabled={phoneNum.source !== 'MPDX'}
                                  />
                                  <FormHelperText
                                    error={true}
                                    data-testid="statusSelectError"
                                  >
                                    {errors.phoneNums &&
                                      errors.phoneNums[index] &&
                                      errors.phoneNums[index]['number']}
                                  </FormHelperText>

                                  {phoneNum.source === 'MPDX' ? (
                                    <Box
                                      data-testid={`delete-${personId}-${index}`}
                                      onClick={() => {
                                        const newPhoneNums = phoneNums.filter(
                                          (n) => n !== phoneNums[index],
                                        );
                                        newPhoneNums[0].primary = true;
                                        setValues({
                                          newPhoneNumber,
                                          phoneNums: newPhoneNums,
                                        });
                                      }}
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
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            className={classes.paddingB2}
                          >
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
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            className={classes.paddingB2}
                          >
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
                                ) =>
                                  setFieldValue(
                                    'newPhoneNumber',
                                    event.target.value,
                                  )
                                }
                                inputProps={{
                                  'data-testid': `addNewNumberInput-${personId}`,
                                }}
                                value={newPhoneNumber}
                              />
                              <FormHelperText
                                error={true}
                                data-testid="statusSelectError"
                              >
                                {errors.newPhoneNumber && errors.newPhoneNumber}
                              </FormHelperText>
                              <Box
                                onClick={() => {
                                  const updatedPhoneNums = phoneNums;
                                  phoneNums.push({
                                    updatedAt: new Date().toISOString(),
                                    number: newPhoneNumber,
                                    primary: false,
                                    source: 'MPDX',
                                  });
                                  setValues({
                                    phoneNums: updatedPhoneNums,
                                    newPhoneNumber: '',
                                  });
                                }}
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
                      <Button
                        type="submit"
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
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Grid>
  );
};

export default Contact;
