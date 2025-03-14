import React, { useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useMassActionsUpdateContactsMutation } from 'src/components/Contacts/MassActions/MassActionsUpdateContacts.generated';
import { LoadingSpinner } from 'src/components/Settings/Organization/LoadingSpinner';
import { StickyButtonHeaderBox } from 'src/components/Shared/Header/styledComponents';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import theme from '../../../theme';
import NoData from '../NoData';
import { ToolsGridContainer } from '../styledComponents';
import Contact from './Contact';
import {
  InvalidNewsletterDocument,
  useInvalidNewsletterQuery,
} from './InvalidNewsletter.generated';
import { useUpdateContactNewsletterMutation } from './UpdateNewsletter.generated';

const useStyles = makeStyles()(() => ({
  outer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
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

export interface ContactUpdateData {
  id: string;
  sendNewsletter: SendNewsletterEnum;
}

interface Props {
  accountListId: string;
}

const FixSendNewsletter: React.FC<Props> = ({ accountListId }: Props) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useInvalidNewsletterQuery({
    variables: { accountListId },
  });
  const totalCount = data?.contacts.totalCount;
  const contactsToFix = data?.contacts.nodes;
  const numberOfContactsShowing = contactsToFix?.length ?? 0;

  const [updateNewsletter, { loading: updating }] =
    useUpdateContactNewsletterMutation();
  const [contactUpdates, setContactUpdates] = useState<ContactUpdateData[]>([]);
  const [updateContacts] = useMassActionsUpdateContactsMutation();
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

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
      refetchQueries: [
        { query: InvalidNewsletterDocument, variables: { accountListId } },
      ],
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

  const handleBulkConfirm = async () => {
    if (!data?.contacts.nodes.length) {
      return;
    }
    await updateContacts({
      variables: {
        accountListId: accountListId ?? '',
        attributes: contactUpdates.map((contact) => ({
          id: contact.id,
          sendNewsletter: contact.sendNewsletter,
        })),
      },
      refetchQueries: [
        {
          query: InvalidNewsletterDocument,
          variables: { accountListId },
        },
      ],
      onError: () => {
        enqueueSnackbar(t(`Error updating contacts`), {
          variant: 'error',
          autoHideDuration: 7000,
        });
      },
    });
    enqueueSnackbar(t('Newsletter statuses updated successfully'), {
      variant: 'success',
    });
  };

  return (
    <Box className={classes.outer} data-testid="Home">
      <ToolsGridContainer container spacing={3}>
        <Grid item xs={12}>
          <Box className={classes.descriptionBox}>
            <Typography>
              <strong>
                {
                  <Trans
                    defaults="You have {{amount}} newsletter statuses to confirm."
                    values={{
                      amount: loading ? '...' : totalCount,
                    }}
                  />
                }
              </strong>
            </Typography>
            <Typography>
              {t(
                'Financial, Special, and Prayer partners that have an empty Newsletter Status appear here. Choose a newsletter status for the contacts below.',
              )}
            </Typography>
          </Box>
        </Grid>
        {!loading && data && !!numberOfContactsShowing ? (
          <>
            <StickyButtonHeaderBox mb={0}>
              <Box>
                <Typography>
                  <Trans
                    defaults="<i>Showing <bold>{{numberOfContacts}}</bold> of <bold>{{totalCount}}</bold></i>"
                    shouldUnescape
                    values={{
                      numberOfContacts: numberOfContactsShowing,
                      totalCount,
                    }}
                    components={{ bold: <strong />, i: <i /> }}
                  />
                </Typography>
              </Box>
              {updating && <LoadingSpinner firstLoad={true} />}
              <Box>
                <Button
                  variant="contained"
                  onClick={() => setShowBulkConfirmModal(true)}
                  disabled={updating || !numberOfContactsShowing}
                  sx={{ mr: 2 }}
                >
                  {
                    <Trans
                      defaults="Confirm All ({{value}})"
                      values={{
                        value: numberOfContactsShowing,
                      }}
                    />
                  }
                </Button>
              </Box>
            </StickyButtonHeaderBox>
            {contactsToFix?.map((contact) => (
              <Contact
                contact={contact}
                key={contact.id}
                handleSingleConfirm={handleSingleConfirm}
                contactUpdates={contactUpdates}
                setContactUpdates={setContactUpdates}
              />
            ))}
          </>
        ) : loading && !data ? (
          <LoadingSpinner firstLoad={true} data-testid="LoadingSpinner" />
        ) : (
          <NoData tool="fixSendNewsletter" />
        )}
      </ToolsGridContainer>
      <Confirmation
        isOpen={showBulkConfirmModal}
        handleClose={() => setShowBulkConfirmModal(false)}
        mutation={handleBulkConfirm}
        title={t('Confirm')}
        message={t(
          'You are updating all contacts visible on this page, setting it to the visible newsletter selection. Are you sure you want to do this?',
        )}
      />
    </Box>
  );
};

export default FixSendNewsletter;
