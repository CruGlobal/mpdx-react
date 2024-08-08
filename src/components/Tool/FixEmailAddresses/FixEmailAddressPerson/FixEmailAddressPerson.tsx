import React, { Fragment, useMemo } from 'react';
import { mdiDelete, mdiLock, mdiStar, mdiStarOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Avatar,
  Box,
  Button,
  Grid,
  Hidden,
  Link,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { useUpdateEmailAddressesMutation } from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses.generated';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { ConfirmButtonIcon } from '../../ConfirmButtonIcon';
import EmailValidationForm from '../EmailValidationForm';
import { EmailAddressData, PersonEmailAddresses } from '../FixEmailAddresses';
import { PersonInvalidEmailFragment } from '../FixEmailAddresses.generated';

const PersonCard = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    border: `1px solid ${theme.palette.cruGrayMedium.main}`,
  },
}));

const Container = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  [theme.breakpoints.down('sm')]: {
    border: `1px solid ${theme.palette.cruGrayMedium.main}`,
  },
}));

const EmailAddressListWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  width: '100%',
  [theme.breakpoints.down('xs')]: {
    paddingTop: theme.spacing(2),
  },
}));

const ConfirmButtonWrapper = styled(Box)(({ theme }) => ({
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
}));

const BoxWithResponsiveBorder = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
  },
}));

const ColumnHeaderWrapper = styled(Grid)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

export const RowWrapper = styled(Grid)(({ theme }) => ({
  paddingBottom: theme.spacing(2),
}));

const HoverableIcon = styled(Icon)(({ theme }) => ({
  '&:hover': {
    color: theme.palette.mpdxBlue.main,
    cursor: 'pointer',
  },
}));

const useStyles = makeStyles()((theme: Theme) => ({
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
}));

export interface FixEmailAddressPersonProps {
  person: PersonInvalidEmailFragment;
  dataState: { [key: string]: PersonEmailAddresses };
  accountListId: string;
  handleChange: (
    personId: string,
    numberIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
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
      <Container container>
        <Grid container>
          <Grid item md={10} xs={12}>
            <PersonCard display="flex" alignItems="center">
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
                      <Link underline="hover" onClick={handleContactNameClick}>
                        <Typography variant="h6">{name}</Typography>
                      </Link>
                    </Box>
                  </Box>
                </Grid>
                <EmailAddressListWrapper item xs={12}>
                  <Grid container>
                    <Hidden xsDown>
                      <ColumnHeaderWrapper item xs={12} sm={6}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          px={2}
                        >
                          <Typography>
                            <strong>{t('Source')}</strong>
                          </Typography>
                          <Typography>
                            <strong>{t('Primary')}</strong>
                          </Typography>
                        </Box>
                      </ColumnHeaderWrapper>
                      <ColumnHeaderWrapper item xs={12} sm={6}>
                        <Box
                          display="flex"
                          justifyContent="flex-start"
                          px={3.25}
                        >
                          <Typography>
                            <strong>{t('Address')}</strong>
                          </Typography>
                        </Box>
                      </ColumnHeaderWrapper>
                    </Hidden>
                    {emails.map((email, index) => (
                      <Fragment key={email.id}>
                        <RowWrapper item xs={12} sm={6}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            px={2}
                          >
                            <Box>
                              <Hidden smUp>
                                <Typography display="inline">
                                  <strong>{t('Source')}: </strong>
                                </Typography>
                              </Hidden>
                              <Typography display="inline">
                                {`${email.source} (${dateFormatShort(
                                  DateTime.fromISO(email.updatedAt),
                                  locale,
                                )})`}
                              </Typography>
                            </Box>
                            {email.isPrimary ? (
                              <Box
                                data-testid={`starIcon-${id}-${index}`}
                                onClick={() => handleChangePrimary(id, index)}
                              >
                                <HoverableIcon path={mdiStar} size={1} />
                              </Box>
                            ) : (
                              <Box
                                data-testid={`starOutlineIcon-${id}-${index}`}
                                onClick={() => handleChangePrimary(id, index)}
                              >
                                <HoverableIcon path={mdiStarOutline} size={1} />
                              </Box>
                            )}
                          </Box>
                        </RowWrapper>
                        <RowWrapper item xs={12} sm={6}>
                          <BoxWithResponsiveBorder
                            display="flex"
                            px={2}
                            justifyContent="flex-start"
                          >
                            <TextField
                              style={{ width: '100%' }}
                              inputProps={{
                                'data-testid': `textfield-${id}-${index}`,
                              }}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>,
                              ) => handleChange(id, index, event)}
                              value={email.email}
                              disabled={email.source !== appName}
                            />

                            {email.source === appName ? (
                              <Box
                                data-testid={`delete-${id}-${index}`}
                                onClick={() =>
                                  handleDeleteEmailOpen({ id, email })
                                }
                              >
                                <HoverableIcon path={mdiDelete} size={1} />
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
                          </BoxWithResponsiveBorder>
                        </RowWrapper>
                      </Fragment>
                    ))}
                    <RowWrapper item xs={12} sm={6}>
                      <Box display="flex" justifyContent="space-between" px={2}>
                        <Box>
                          <Hidden smUp>
                            <Typography display="inline">
                              <strong>{t('Source')}: </strong>
                            </Typography>
                          </Hidden>
                          <Typography display="inline">MPDX</Typography>
                        </Box>
                      </Box>
                    </RowWrapper>
                    <RowWrapper item xs={12} sm={6}>
                      <BoxWithResponsiveBorder
                        display="flex"
                        justifyContent="flex-start"
                        px={2}
                      >
                        <EmailValidationForm
                          personId={id}
                          accountListId={accountListId}
                        />
                      </BoxWithResponsiveBorder>
                    </RowWrapper>
                  </Grid>
                </EmailAddressListWrapper>
              </Grid>
            </PersonCard>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box
              display="flex"
              flexDirection="column"
              style={{ paddingLeft: theme.spacing(1) }}
            >
              <ConfirmButtonWrapper>
                <Button
                  variant="contained"
                  style={{ width: '100%' }}
                  onClick={() =>
                    handleSingleConfirm(person, emails as EmailAddressData[])
                  }
                  disabled={!hasOnePrimaryEmail()}
                >
                  <ConfirmButtonIcon />
                  {t('Confirm')}
                </Button>
              </ConfirmButtonWrapper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {deleteModalOpen && emailToDelete && (
        <Confirmation
          title={t('Confirm')}
          isOpen={true}
          message={
            <Typography>
              {t('Are you sure you wish to delete this email address:')}{' '}
              <strong>{emailToDelete?.email.email}</strong>
            </Typography>
          }
          mutation={handleDelete}
          handleClose={handleDeleteEmailModalClose}
        />
      )}
    </>
  );
};
