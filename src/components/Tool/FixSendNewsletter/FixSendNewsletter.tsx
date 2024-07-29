import React from 'react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import theme from '../../../theme';
import NoData from '../NoData';
import Contact from './Contact';
import {
  InvalidNewsletterDocument,
  InvalidNewsletterQuery,
  useInvalidNewsletterQuery,
} from './InvalidNewsletter.generated';
import { useUpdateContactNewsletterMutation } from './UpdateNewsletter.generated';

const useStyles = makeStyles()(() => ({
  container: {
    padding: theme.spacing(3),
    width: '70%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  descriptionBox: {
    marginBottom: theme.spacing(2),
  },
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  buttonBlue: {
    backgroundColor: theme.palette.mpdxBlue.main,
    marginTop: theme.spacing(1),
    color: 'white',
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
}));

interface Props {
  accountListId: string;
  setContactFocus: SetContactFocus;
}

const FixSendNewsletter: React.FC<Props> = ({
  accountListId,
  setContactFocus,
}: Props) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useInvalidNewsletterQuery({
    variables: { accountListId },
  });

  let numberOfContacts = data?.contacts.nodes.length ?? 0;
  if (data) {
    const filtered = data.contacts.nodes.filter((node) => {
      return !node.primaryPerson?.deceased;
    });
    numberOfContacts = filtered.length;
  }
  const [updateNewsletter, { loading: updating }] =
    useUpdateContactNewsletterMutation();

  const handleSingleConfirm = async (
    id: string,
    name: string,
    sendNewsletter: string,
  ): Promise<void> => {
    const attributes = {
      id,
      sendNewsletter: sendNewsletter as SendNewsletterEnum,
    };
    await updateNewsletter({
      variables: {
        accountListId,
        attributes,
      },
      update: (cache, { data: updateContactData }) => {
        const updateContactId =
          updateContactData?.updateContact?.contact.id || '';

        const query = {
          query: InvalidNewsletterDocument,
          variables: {
            accountListId,
          },
        };

        const dataFromCache = cache.readQuery<InvalidNewsletterQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            contacts: {
              ...dataFromCache.contacts,
              nodes: dataFromCache.contacts.nodes.filter(
                (contact) =>
                  contact.id !== updateContactId &&
                  !contact.primaryPerson?.deceased,
              ),
            },
            constant: dataFromCache.constant,
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onError() {
        enqueueSnackbar(t(`Error updating contact ${name}`), {
          variant: 'error',
          autoHideDuration: 7000,
        });
      },
    });
    enqueueSnackbar(t('Newsletter updated!'), {
      variant: 'success',
    });
  };

  return (
    <Box className={classes.outer} data-testid="Home">
      {!loading && !updating && data ? (
        <Grid container className={classes.container}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Fix Send Newsletter')}</Typography>
            <Divider className={classes.divider} />
          </Grid>
          {numberOfContacts > 0 ? (
            <>
              <Grid item xs={12}>
                <Box className={classes.descriptionBox}>
                  <Typography>
                    <strong>
                      {t(
                        'You have {{amount}} newsletter statuses to confirm.',
                        {
                          amount: numberOfContacts,
                        },
                      )}
                    </strong>
                  </Typography>
                  <Typography>
                    {t(
                      'Contacts that appear here have an empty Newsletter Status and Partner Status set to Financial, Special, or Pray. Choose a newsletter status for contacts below.',
                    )}
                  </Typography>
                  <Button variant="contained" className={classes.buttonBlue}>
                    <Icon
                      path={mdiCheckboxMarkedCircle}
                      size={0.8}
                      className={classes.buttonIcon}
                    />
                    <Trans
                      defaults="Cofirm {{value}}"
                      values={{
                        value: numberOfContacts,
                      }}
                    />
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                {data.contacts.nodes.map(
                  (contact) =>
                    !contact.primaryPerson?.deceased && (
                      <Contact
                        id={contact.id}
                        name={contact.name}
                        // need to fix this after changes to fix commitment info get merged
                        status={
                          data.constant.status?.find(
                            (status) => contact.status === status.id,
                          )?.value || ''
                        }
                        primaryPerson={
                          contact.primaryPerson || {
                            firstName: '',
                            lastName: '',
                            primaryEmailAddress: {
                              email: '',
                            },
                            optoutEnewsletter: false,
                            deceased: false,
                          }
                        }
                        key={contact.id}
                        primaryAddress={
                          contact.primaryAddress || {
                            street: '',
                            city: '',
                            state: '',
                            postalCode: '',
                            source: '',
                            createdAt: '',
                          }
                        }
                        handleSingleConfirm={handleSingleConfirm}
                        setContactFocus={setContactFocus}
                      />
                    ),
                )}
              </Grid>
              <Grid item xs={12}>
                <Box className={classes.footer}>
                  <Typography>
                    <Trans
                      defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                      shouldUnescape
                      values={{
                        value: numberOfContacts,
                      }}
                      components={{ bold: <strong /> }}
                    />
                  </Typography>
                </Box>
              </Grid>
            </>
          ) : (
            <NoData tool="fixSendNewsletter" />
          )}
        </Grid>
      ) : (
        <CircularProgress style={{ marginTop: theme.spacing(3) }} />
      )}
    </Box>
  );
};

export default FixSendNewsletter;
