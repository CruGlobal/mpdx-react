import React, { Fragment, ReactElement, useMemo } from 'react';
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
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { editableSources } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/EditContactAddressModal/EditContactAddressModal';
import { useUpdateEmailAddressesMutation } from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses.generated';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import i18n from 'src/lib/i18n';
import { dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { sourceToStr } from 'src/utils/sourceToStr';
import EmailValidationForm from '../EmailValidationForm';
import { EmailAddressData, PersonEmailAddresses } from '../FixEmailAddresses';
import { PersonInvalidEmailFragment } from '../FixEmailAddresses.generated';

const useStyles = makeStyles()((theme: Theme) => ({
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
  contactAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  contactCardContent: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  confirmButon: {
    marginRight: theme.spacing(1),
  },
  contactCard: {
    marginBottom: theme.spacing(2),
  },
  contactContainer: {
    display: 'block',
    alignItems: 'center',
    width: '99%',
    margin: 'auto',
    height: '100%',
    marginBottom: theme.spacing(3),
  },
  contactHeader: {
    '.MuiCardHeader-action': {
      alignSelf: 'center',
    },
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
}));

export interface FixEmailAddressPersonProps {
  person: PersonInvalidEmailFragment;
  dataState: { [key: string]: PersonEmailAddresses };
  accountListId: string;
  handleChange: (
    personId: string,
    numberIndex: number,
    newEmail: string,
  ) => void;
  handleChangePrimary: (personId: string, emailIndex: number) => void;
  handleSingleConfirm: (
    person: PersonInvalidEmailFragment,
    emails: EmailAddressData[],
  ) => void;
  setContactFocus: SetContactFocus;
}

interface Email {
  isValid: boolean;
  personId: string;
  isPrimary: boolean;
  id: string;
  primary: boolean;
  updatedAt: string;
  source: string;
  email: string;
  destroy?: boolean | undefined;
}

interface EmailToDelete {
  id: string;
  email: Email;
}

const validationSchema = yup.object({
  newEmail: yup
    .string()
    .email(i18n.t('Invalid Email Address Format'))
    .required(i18n.t('Please enter a valid email address')),
});

export const FixEmailAddressPerson: React.FC<FixEmailAddressPersonProps> = ({
  person,
  dataState,
  accountListId,
  handleChange,
  handleChangePrimary,
  handleSingleConfirm,
  setContactFocus,
}) => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const locale = useLocale();
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [updateEmailAddressesMutation] = useUpdateEmailAddressesMutation();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [emailToDelete, setEmailToDelete] =
    React.useState<EmailToDelete | null>(null);

  const { id, contactId } = person;
  const name = `${person.firstName} ${person.lastName}`;

  const emails: Email[] = useMemo(() => {
    if (!dataState[id]?.emailAddresses.length) {
      return [];
    }

    return (
      dataState[id]?.emailAddresses.map((email) => ({
        ...email,
        isValid: false,
        personId: id,
        isPrimary: email.primary,
      })) || []
    );
  }, [person, dataState]);

  const handleDelete = async (): Promise<void> => {
    if (!emailToDelete) {
      return;
    }
    const { id: personId, email } = emailToDelete;
    await updateEmailAddressesMutation({
      variables: {
        input: {
          accountListId,
          attributes: {
            id: personId,
            emailAddresses: [
              {
                id: email.id,
                destroy: true,
              },
            ],
          },
        },
      },
      update: (cache) => {
        cache.evict({ id: `EmailAddress:${email.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(`Successfully deleted email address ${email.email}`),
          {
            variant: 'success',
          },
        );
        handleDeleteEmailModalClose();
      },
      onError: () => {
        enqueueSnackbar(t(`Error deleting email address ${email.email}`), {
          variant: 'error',
        });
      },
    });
  };

  const handleContactNameClick = () => {
    setContactFocus(contactId);
  };

  const handleDeleteEmailOpen = ({ id, email }: EmailToDelete) => {
    setDeleteModalOpen(true);
    setEmailToDelete({ id, email });
  };
  const handleDeleteEmailModalClose = (): void => {
    setDeleteModalOpen(false);
    setEmailToDelete(null);
  };

  const hasOnePrimaryEmail = (): boolean => {
    return emails.filter((email) => email.isPrimary)?.length === 1;
  };

  return (
    <>
      <Grid container className={classes.contactContainer}>
        <Grid container>
          <Card className={classes.contactCard}>
            <Box display="flex" alignItems="center">
              <Grid container>
                <Grid item xs={12}>
                  <CardHeader
                    className={classes.contactHeader}
                    avatar={
                      <Avatar
                        className={classes.contactAvatar}
                        src={person?.avatar || ''}
                        aria-label="Contact Avatar"
                        onClick={handleContactNameClick}
                      />
                    }
                    action={
                      <Button
                        className={classes.confirmButon}
                        variant="contained"
                        onClick={() =>
                          handleSingleConfirm(
                            person,
                            emails as EmailAddressData[],
                          )
                        }
                        disabled={!hasOnePrimaryEmail()}
                      >
                        <Icon
                          path={mdiCheckboxMarkedCircle}
                          size={0.8}
                          className={classes.buttonIcon}
                        />
                        {t('Confirm')}
                      </Button>
                    }
                    title={
                      <Link underline="hover" onClick={handleContactNameClick}>
                        <Typography variant="subtitle1" display="inline">
                          {name}
                        </Typography>
                      </Link>
                    }
                  />
                </Grid>

                <CardContent className={classes.contactCardContent}>
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
                            {t('Email Address')}
                          </Typography>
                        </Box>
                      </Grid>
                    </Hidden>
                    {emails.map((email, index) => (
                      <Formik
                        key={index}
                        enableReinitialize={true}
                        initialValues={{
                          newEmail: email.email,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                          handleChange(id, index, values.newEmail);
                        }}
                      >
                        {({
                          values: { newEmail },
                          setFieldValue,
                          handleSubmit,
                          errors,
                        }): ReactElement => (
                          <Fragment>
                            <Grid
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
                                      email.source,
                                    )} (${dateFormatShort(
                                      DateTime.fromISO(email.updatedAt),
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
                                  {email.isPrimary ? (
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
                                        data-testid={`starIcon-${id}-${index}`}
                                        className={classes.hoverHighlight}
                                        onClick={() =>
                                          handleChangePrimary(id, index)
                                        }
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
                                          data-testid={`starOutlineIcon-${id}-${index}`}
                                          className={classes.hoverHighlight}
                                          onClick={() =>
                                            handleChangePrimary(id, index)
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
                                      'data-testid': `textfield-${id}-${index}`,
                                    }}
                                    name="newEmail"
                                    value={newEmail}
                                    onChange={(e) => {
                                      setFieldValue('newEmail', e.target.value);
                                      handleSubmit();
                                    }}
                                    disabled={
                                      editableSources.indexOf(email.source) ===
                                      -1
                                    }
                                  />
                                  <FormHelperText
                                    error={true}
                                    data-testid="statusSelectError"
                                  >
                                    {errors.newEmail}
                                  </FormHelperText>
                                </FormControl>

                                {editableSources.indexOf(email.source) > -1 ? (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    data-testid={`delete-${id}-${index}`}
                                    onClick={() =>
                                      handleDeleteEmailOpen({ id, email })
                                    }
                                    className={classes.paddingX}
                                  >
                                    <Tooltip
                                      title={t('Delete Email')}
                                      placement="left"
                                    >
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

                    <EmailValidationForm
                      personId={id}
                      accountListId={accountListId}
                    />
                  </Grid>
                </CardContent>
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>
      {deleteModalOpen && emailToDelete && (
        <Confirmation
          title={t('Confirm')}
          isOpen={true}
          message={
            <>
              {t('Are you sure you wish to delete this email address:')}{' '}
              <strong>{emailToDelete?.email.email}</strong>
            </>
          }
          mutation={handleDelete}
          handleClose={handleDeleteEmailModalClose}
        />
      )}
    </>
  );
};
