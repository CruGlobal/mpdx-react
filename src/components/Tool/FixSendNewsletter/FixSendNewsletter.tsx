import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { Icon } from '@mdi/react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { useTranslation, Trans } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { SendNewsletterEnum } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import NoData from '../NoData';
import Contact from './Contact';
import {
  GetInvalidNewsletterDocument,
  GetInvalidNewsletterQuery,
  useGetInvalidNewsletterQuery,
} from './GetInvalidNewsletter.generated';
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
}

const FixSendNewsletter: React.FC<Props> = ({ accountListId }: Props) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useGetInvalidNewsletterQuery({
    variables: { accountListId },
  });
  const [updateNewsletter, { loading: updating }] =
    useUpdateContactNewsletterMutation();

  //TODO: Add deceased to contact filters
  const updateContact = async (
    id: string,
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
          query: GetInvalidNewsletterDocument,
          variables: {
            accountListId,
          },
        };

        const dataFromCache = cache.readQuery<GetInvalidNewsletterQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            contacts: {
              ...dataFromCache.contacts,
              nodes: dataFromCache.contacts.nodes.filter(
                (contact) => contact.id !== updateContactId,
              ),
            },
          };
          cache.writeQuery({ ...query, data });
        }
      },
    });
    enqueueSnackbar(t('Newsletter updated!'), {
      variant: 'success',
    });
  };

  return (
    <>
      <Box className={classes.outer} data-testid="Home">
        {!loading && !updating && data ? (
          <Grid container className={classes.container}>
            <Grid item xs={12}>
              <Typography variant="h4">{t('Fix Send Newsletter')}</Typography>
              <Divider className={classes.divider} />
            </Grid>
            {data?.contacts.nodes.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <Box className={classes.descriptionBox}>
                    <Typography>
                      <strong>
                        {t(
                          'You have {{amount}} newsletter statuses to confirm.',
                          {
                            amount: data?.contacts.nodes.length,
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
                          value: data?.contacts.nodes.length,
                        }}
                      />
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  {data.contacts.nodes.map((contact) => (
                    <Contact
                      id={contact.id}
                      name={contact.name}
                      // need to fix this after changes to fix commitment info get merged
                      status={contact.status || ''}
                      primaryPerson={
                        contact.primaryPerson || {
                          firstName: '',
                          lastName: '',
                          primaryEmailAddress: {
                            email: '',
                          },
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
                          updatedAt: '',
                        }
                      }
                      updateFunction={updateContact}
                    />
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Box className={classes.footer}>
                    <Typography>
                      <Trans
                        defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                        values={{
                          value: data?.contacts.nodes.length,
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
    </>
  );
};

export default FixSendNewsletter;
