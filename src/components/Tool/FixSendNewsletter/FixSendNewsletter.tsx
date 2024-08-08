import React, { useMemo } from 'react';
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
import { LoadingSpinner } from 'src/components/Settings/Organization/LoadingSpinner';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import theme from '../../../theme';
import { ButtonHeaderBox } from '../MergeContacts/StickyConfirmButtons';
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
    width: '80%',
    display: 'flex',
    height: 'auto',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  descriptionBox: {
    marginBottom: theme.spacing(1),
  },
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
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
  const totalCount = data?.contacts.totalCount;
  let numberOfContacts = data?.contacts.nodes?.length ?? 0;

  const contactsToFix = useMemo(
    () =>
      data?.contacts?.nodes.filter(
        (contact) => !contact?.primaryPerson?.deceased,
      ),
    [data],
  );
  if (contactsToFix) {
    numberOfContacts = contactsToFix?.length;
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
    <Box
      className={classes.outer}
      display="flex"
      flexDirection="column"
      data-testid="Home"
    >
      {!loading && !updating && data ? (
        <Grid container className={classes.container}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Fix Send Newsletter')}</Typography>
            <Divider className={classes.divider} />
          </Grid>
          {!!numberOfContacts ? (
            <>
              <Grid item xs={12}>
                <Box className={classes.descriptionBox}>
                  <Typography>
                    <strong>
                      {
                        <Trans
                          defaults="You have {{amount}} newsletter statuses to confirm."
                          values={{
                            amount: numberOfContacts,
                          }}
                        />
                      }
                    </strong>
                  </Typography>
                  <Typography>
                    {t(
                      'Contacts that appear here have an empty Newsletter Status and Partner Status set to Financial, Special, or Pray. Choose a newsletter status for contacts below.',
                    )}
                  </Typography>
                </Box>
              </Grid>
              <ButtonHeaderBox mb={0}>
                <Box>
                  <Typography>
                    <Trans
                      defaults="<i>Showing <bold>{{numberOfContacts}}</bold> of <bold>{{totalCount}}</bold></i>"
                      shouldUnescape
                      values={{
                        numberOfContacts,
                        totalCount,
                      }}
                      components={{ bold: <strong />, i: <i /> }}
                    />
                  </Typography>
                </Box>
                {(loading || updating) && (
                  <LoadingSpinner
                    firstLoad={true}
                    data-testid="LoadingSpinner"
                  />
                )}
                <Box>
                  <Button
                    variant="contained"
                    onClick={() => null}
                    disabled={updating || !numberOfContacts}
                    sx={{ mr: 2 }}
                  >
                    {
                      <Trans
                        defaults="Confirm All ({{value}})"
                        values={{
                          value: numberOfContacts,
                        }}
                      />
                    }
                  </Button>
                </Box>
              </ButtonHeaderBox>
              {contactsToFix?.map((contact) => (
                <Contact
                  id={contact.id}
                  name={contact.name}
                  // need to fix this after changes to fix commitment info get merged
                  avatar={contact.avatar}
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
                      country: '',
                      postalCode: '',
                      source: '',
                      createdAt: '',
                    }
                  }
                  handleSingleConfirm={handleSingleConfirm}
                  setContactFocus={setContactFocus}
                />
              ))}
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
