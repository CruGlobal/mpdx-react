import NextLink from 'next/link';
import React, { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Hidden,
  Link,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { useContactLinks } from 'src/hooks/useContactLinks';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import { ContactPhoneNumbers } from './ContactPhoneNumbers';
import { PersonInvalidNumberFragment } from './GetInvalidPhoneNumbers.generated';
import { ImperativeSubmit } from './ImperativeSubmit';
import PhoneValidationForm from './PhoneNumberValidationForm';
import {
  useUpdateInvalidPhoneNumbersMutation,
  useUpdatePhoneNumberMutation,
} from './UpdateInvalidPhoneNumbers.generated';

const useStyles = makeStyles()(() => ({
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
  submitAll: boolean; // Used as a trigger to submit each individual form
  person: PersonInvalidNumberFragment;
  accountListId: string;
}

const Contact: React.FC<Props> = ({ person, submitAll, accountListId }) => {
  const { t } = useTranslation();
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
  const [updateInvalidPhoneNumbers] = useUpdateInvalidPhoneNumbersMutation();

  const name: string = `${person.firstName} ${person.lastName}`;

  const validationSchema = yup.object().shape({
    numbers: yup
      .array()
      .of(
        yup.object().shape({
          number: yup
            .string()
            .test(
              'is-phone-number',
              t('This field is not a valid phone number'),
              (val) => typeof val === 'string' && /\d/.test(val),
            )
            .required(t('This field is required')),
          primary: yup.bool(),
        }),
      )
      .required(t('Must have at least 1 Phone Number to confirm')),
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

  const handleSingleConfirm = async (numbers: PhoneNumber[]) => {
    const personName = `${person.firstName} ${person.lastName}`;
    const phoneNumbers = numbers.map((phoneNumber) => ({
      id: phoneNumber.id,
      primary: phoneNumber.primary,
      number: phoneNumber.number,
      validValues: true,
    }));

    await updateInvalidPhoneNumbers({
      variables: {
        input: {
          accountListId,
          attributes: [
            {
              id: person.id,
              phoneNumbers,
            },
          ],
        },
      },
      update: (cache) => {
        cache.evict({ id: `Person:${person.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(`Successfully updated phone numbers for {{name}}`, {
            name: personName,
          }),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(
          t(`Error updating phone numbers for {{name}}`, { name: personName }),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  return (
    <Formik
      validationSchema={validationSchema}
      enableReinitialize
      initialValues={{
        numbers: person.phoneNumbers.nodes.map((phoneNumber) => ({
          id: phoneNumber?.id,
          number: phoneNumber?.number ?? '',
          primary: phoneNumber?.primary,
          source: phoneNumber?.source,
          updatedAt: phoneNumber?.updatedAt,
        })),
      }}
      onSubmit={({ numbers }) => handleSingleConfirm(numbers)}
    >
      {({ values, handleSubmit, errors, setFieldValue }): ReactElement => (
        <form>
          <ImperativeSubmit submitAll={submitAll} />
          <Grid container className={classes.container}>
            <Grid container>
              <Card className={classes.contactCard}>
                <Box
                  display="flex"
                  alignItems="center"
                  className={classes.left}
                >
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
                            onClick={() => handleSubmit()}
                            variant="contained"
                            style={{ width: '100%' }}
                            disabled={Object.keys(errors).length > 0}
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
                              <Typography variant="body2" fontWeight="bold">
                                {t('Phone Number')}
                              </Typography>
                            </Box>
                          </Grid>
                        </Hidden>
                        {values.numbers.map((phoneNumber, index) => (
                          <ContactPhoneNumbers
                            key={phoneNumber.id}
                            errors={errors}
                            index={index}
                            person={person}
                            phoneNumber={phoneNumber}
                            values={values}
                            setFieldValue={setFieldValue}
                            handleDeleteNumberOpen={handleDeleteNumberOpen}
                          />
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
        </form>
      )}
    </Formik>
  );
};

export default Contact;
