import NextLink from 'next/link';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { mdiCheckboxMarkedCircle, mdiDelete, mdiLock } from '@mdi/js';
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
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { useContactLinks } from 'src/hooks/useContactLinks';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { isEditableSource, sourceToStr } from 'src/utils/sourceHelper';
import theme from '../../../theme';
import { PersonInvalidNumberFragment } from './GetInvalidPhoneNumbers.generated';
import PhoneValidationForm from './PhoneNumberValidationForm';
import { useUpdatePhoneNumberMutation } from './UpdateInvalidPhoneNumbers.generated';

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
  phoneNumberContainer: {
    width: '100%',
  },
  hoverHighlight: {
    '&:hover': {
      color: theme.palette.mpdxBlue.main,
      cursor: 'pointer',
    },
  },
  ContactIconContainer: {
    margin: theme.spacing(0, 1),
    width: theme.spacing(4),
    height: theme.spacing(4),
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

interface AutoSubmitProps {
  values: any;
  submitForm: () => void;
}

const AutoSubmit: React.FC<AutoSubmitProps> = ({ values, submitForm }) => {
  useEffect(() => {
    submitForm();
  }, [values, submitForm]);

  return null;
};

export interface PhoneNumber {
  id: string;
  number: string;
  primary: boolean;
  source: string;
  updatedAt: string;
}

export interface PhoneNumberData {
  phoneNumbers: PhoneNumber[];
}

interface NumberToDelete {
  personId: string;
  phoneNumber: PhoneNumber;
}

interface Props {
  person: PersonInvalidNumberFragment;
  handleChange: (
    personId: string,
    numberIndex: number,
    newNumber: string,
  ) => void;
  handleSingleConfirm: (
    person: PersonInvalidNumberFragment,
    numbers: PhoneNumber[],
  ) => void;
  dataState: { [key: string]: PhoneNumberData };
  handleChangePrimary: (personId: string, numberIndex: number) => void;
  accountListId: string;
}

const Contact: React.FC<Props> = ({
  person,
  handleChange,
  handleSingleConfirm,
  dataState,
  handleChangePrimary,
  accountListId,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const { classes } = useStyles();
  const { appName } = useGetAppSettings();
  const { getContactUrl } = useContactLinks({
    url: `/accountLists/${accountListId}/tools/fix/phoneNumbers/`,
  });
  const [updatePhoneNumber] = useUpdatePhoneNumberMutation();
  const [numberToDelete, setNumberToDelete] = useState<NumberToDelete | null>(
    null,
  );
  const { id: personId, contactId } = person;

  const contactUrl = getContactUrl(contactId);

  const numbers: PhoneNumber[] = useMemo(() => {
    return (
      dataState[personId]?.phoneNumbers.map((number) => ({
        ...number,
        isValid: false,
        personId: personId,
        isPrimary: number.primary,
      })) || []
    );
  }, [person, dataState]);

  const name: string = `${person.firstName} ${person.lastName}`;

  const validationSchema = yup.object({
    newPhone: yup
      .string()
      .test(
        'is-phone-number',
        t('This field is not a valid phone number'),
        (val) => typeof val === 'string' && /\d/.test(val),
      )
      .required(t('This field is required')),
  });

  const handleDeleteNumberOpen = ({
    personId,
    phoneNumber,
  }: NumberToDelete) => {
    setNumberToDelete({ personId, phoneNumber });
  };

  const handleDelete = async (): Promise<void> => {
    if (!numberToDelete) {
      return;
    }
    const { personId, phoneNumber } = numberToDelete;
    await updatePhoneNumber({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            id: personId,
            phoneNumbers: [
              {
                id: phoneNumber.id,
                destroy: true,
              },
            ],
          },
        },
      },
      update: (cache) => {
        cache.evict({ id: `PhoneNumber:${phoneNumber.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(`Successfully deleted phone number {{phoneNumber}}`, {
            phoneNumber: phoneNumber.number,
          }),
          {
            variant: 'success',
          },
        );
        handleDeleteNumberModalClose();
      },
      onError: () => {
        enqueueSnackbar(
          t(`Error deleting phone number {{phoneNumber}}`, {
            phoneNumber: phoneNumber.number,
          }),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  const handleDeleteNumberModalClose = (): void => {
    setNumberToDelete(null);
  };

  return (
    <>
      <Grid container className={classes.container}>
        <Grid container>
          <Card className={classes.contactCard}>
            <Box display="flex" alignItems="center" className={classes.left}>
              <Grid container>
                <Grid item xs={12}>
                  <ContactHeader
                    avatar={
                      <Link component={NextLink} href={contactUrl} shallow>
                        <ContactAvatar
                          src={person?.avatar || ''}
                          aria-label="Contact Avatar"
                        />
                      </Link>
                    }
                    title={
                      <Link component={NextLink} href={contactUrl} shallow>
                        <Typography
                          variant="subtitle1"
                          sx={{ display: 'inline' }}
                        >
                          {name}
                        </Typography>
                      </Link>
                    }
                    action={
                      <Button
                        data-testid={`confirmButton-${person.id}`}
                        onClick={() => handleSingleConfirm(person, numbers)}
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
                <CardContent sx={{ padding: 2 }}>
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
                      <Formik
                        key={phoneNumber.id}
                        enableReinitialize={true}
                        initialValues={{
                          newPhone: phoneNumber.number,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                          handleChange(personId, index, values.newPhone);
                        }}
                      >
                        {({
                          values: { newPhone },
                          setFieldValue,
                          handleSubmit,
                          errors,
                        }): ReactElement => (
                          <>
                            <AutoSubmit
                              values={newPhone}
                              submitForm={handleSubmit}
                            />
                            <Grid
                              data-testid="phoneNumbers"
                              item
                              xs={6}
                              sm={4}
                              className={classes.paddingB2}
                            >
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
                                    {`${sourceToStr(
                                      t,
                                      phoneNumber.source,
                                    )} (${dateFormatShort(
                                      DateTime.fromISO(phoneNumber.updatedAt),
                                      locale,
                                    )})`}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid
                              item
                              xs={6}
                              sm={2}
                              className={classes.paddingB2}
                            >
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
                                        data-testid={`starIcon-${person.id}-${phoneNumber.id}`}
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
                                      <Tooltip
                                        title={t('Set as Primary')}
                                        placement="left"
                                      >
                                        <StarOutlineIcon
                                          data-testid={`starOutlineIcon-${person.id}-${phoneNumber.id}`}
                                          className={classes.hoverHighlight}
                                          onClick={() =>
                                            handleChangePrimary(personId, index)
                                          }
                                        />
                                      </Tooltip>
                                    </>
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
                                <FormControl fullWidth>
                                  <TextField
                                    style={{ width: '100%' }}
                                    size="small"
                                    inputProps={{
                                      'data-testid': `textfield-${person.id}-${phoneNumber.id}`,
                                    }}
                                    name="newPhone"
                                    value={newPhone}
                                    onChange={(e) => {
                                      setFieldValue('newPhone', e.target.value);
                                    }}
                                    disabled={
                                      !isEditableSource(phoneNumber.source)
                                    }
                                  />
                                  <FormHelperText
                                    error={true}
                                    data-testid="statusSelectError"
                                  >
                                    {errors.newPhone}
                                  </FormHelperText>
                                </FormControl>
                                {isEditableSource(phoneNumber.source) ? (
                                  <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                  >
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      data-testid={`delete-${person.id}-${phoneNumber.id}`}
                                      onClick={() =>
                                        handleDeleteNumberOpen({
                                          personId,
                                          phoneNumber,
                                        })
                                      }
                                      className={classes.ContactIconContainer}
                                    >
                                      <Tooltip
                                        title={t('Delete Number')}
                                        placement="left"
                                      >
                                        <Icon
                                          path={mdiDelete}
                                          size={1}
                                          className={classes.hoverHighlight}
                                        />
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                  >
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
                                          color:
                                            theme.palette.cruGrayMedium.main,
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </Grid>
                          </>
                        )}
                      </Formik>
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
                    <PhoneValidationForm
                      personId={personId}
                      accountListId={accountListId}
                    />
                  </Grid>
                </CardContent>
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>
      {numberToDelete && (
        <Confirmation
          title={t('Confirm')}
          isOpen={true}
          message={
            <>
              {t('Are you sure you wish to delete this number:')}{' '}
              <strong>{numberToDelete?.phoneNumber.number}</strong>
            </>
          }
          mutation={handleDelete}
          handleClose={handleDeleteNumberModalClose}
        />
      )}
    </>
  );
};

export default Contact;
