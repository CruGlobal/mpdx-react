import React, { useMemo, useState } from 'react';
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
import { useMassActionsMergeMutation } from 'src/components/Contacts/MassActions/Merge/MassActionsMerge.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import NoData from '../NoData';
import Contact from './Contact';
import { useGetContactDuplicatesQuery } from './GetContactDuplicates.generated';

const useStyles = makeStyles()(() => ({
  container: {
    padding: theme.spacing(3),
    width: '80%',
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
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
    marginBottom: theme.spacing(2),
  },
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface ActionType {
  action: string;
  mergeId?: string;
}

interface Props {
  accountListId: string;
}

const MergeContacts: React.FC<Props> = ({ accountListId }: Props) => {
  const { classes } = useStyles();
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useGetContactDuplicatesQuery({
    variables: { accountListId },
  });
  const { appName } = useGetAppSettings();
  const [contactsMerge, { loading: updating }] = useMassActionsMergeMutation();
  const actionsLength = useMemo(
    () => Object.entries(actions).length,
    [actions],
  );
  const disabled = updating || !actionsLength;

  const updateActions = (id1: string, id2: string, action: string): void => {
    if (action === 'cancel') {
      setActions((prevState) => ({
        ...prevState,
        [id1]: { action: '' },
        [id2]: { action: '' },
      }));
    } else {
      setActions((prevState) => ({
        ...prevState,
        [id1]: { action: 'merge', mergeId: id2 },
        [id2]: { action: 'delete' },
      }));
    }
  };
  const handleConfirmAndContinue = () => {
    mergeContacts();
  };
  const handleConfirmAndLeave = () => {
    mergeContacts();
    window.location.href = `${process.env.SITE_URL}/accountLists/${accountListId}/tools`;
  };

  const mergeContacts = async () => {
    const mergeActions = Object.entries(actions).filter(
      (action) => action[1].action === 'merge',
    );
    if (mergeActions.length > 0) {
      const winnersAndLosers: { winner_id: string; loser_id: string }[] =
        mergeActions.map((action) => {
          return { winner_id: action[0], loser_id: action[1].mergeId || '' };
        });
      await contactsMerge({
        variables: {
          input: {
            winnersAndLosers,
          },
        },
        update: (cache) => {
          // Delete the loser contacts and remove dangling references to them
          winnersAndLosers.forEach((contact) => {
            cache.evict({ id: `Contact:${contact.loser_id}` });
          });
          cache.gc();
        },
        onCompleted: () => {
          enqueueSnackbar(t('Contacts merged!'), {
            variant: 'success',
          });
        },
        onError: (err) => {
          enqueueSnackbar(t('A server error occurred. {{err}}', { err }), {
            variant: 'error',
          });
        },
      });
    }
  };

  return (
    <Box
      className={classes.outer}
      display="flex"
      flexDirection="column"
      data-testid="Home"
    >
      {!loading && data ? (
        <Grid container className={classes.container}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Merge Contacts')}</Typography>
            <Divider className={classes.divider} />
          </Grid>
          {data?.contactDuplicates.nodes.length > 0 ? (
            <>
              <Grid item xs={12}>
                <Box
                  className={classes.descriptionBox}
                  data-testid="ContactMergeDescription"
                >
                  <Typography>
                    {t(
                      'You have {{totalCount}} possible duplicate contacts. This is sometimes caused when you imported data into {{appName}}. We recommend reconciling these as soon as possible. Please select the duplicate that should win the merge. No data will be lost. ',
                      {
                        totalCount: data?.contactDuplicates.totalCount,
                        appName,
                      },
                    )}
                  </Typography>
                  <Typography>
                    <strong>{t('This cannot be undone.')}</strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                {data?.contactDuplicates.nodes.map((duplicate) => (
                  <Contact
                    key={duplicate.id}
                    contact1={duplicate.recordOne}
                    contact2={duplicate.recordTwo}
                    update={updateActions}
                  />
                ))}
              </Grid>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  style={{ width: '100%' }}
                  p={2}
                >
                  <Button
                    variant="contained"
                    disabled={disabled}
                    onClick={() => handleConfirmAndContinue()}
                  >
                    {t('Confirm and Continue')}
                  </Button>
                  <Box ml={2} mr={2}>
                    <Typography>
                      <strong>{t('OR')}</strong>
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    disabled={disabled}
                    onClick={() => handleConfirmAndLeave()}
                  >
                    {t('Confirm and Leave')}
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box className={classes.footer}>
                  <Typography>
                    <Trans
                      defaults="Showing <bold>{{loaded}}</bold> of <bold>{{totalCount}}</bold>"
                      shouldUnescape
                      values={{
                        loaded: data?.contactDuplicates.nodes.length,
                        totalCount: data?.contactDuplicates.totalCount,
                      }}
                      components={{ bold: <strong /> }}
                    />
                  </Typography>
                </Box>
              </Grid>
            </>
          ) : (
            <NoData tool="mergeContacts" />
          )}
        </Grid>
      ) : (
        <CircularProgress style={{ marginTop: theme.spacing(3) }} />
      )}
    </Box>
  );
};

export default MergeContacts;
