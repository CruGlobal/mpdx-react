import React, { memo, useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { useMassActionsMergeMutation } from 'src/components/Contacts/MassActions/Merge/MassActionsMerge.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import NoData from '../NoData';
import ContactPair from './ContactPair';
import { useGetContactDuplicatesQuery } from './GetContactDuplicates.generated';
import { StickyConfirmButtons } from './StickyConfirmButtons';

const useStyles = makeStyles()(() => ({
  container: {
    padding: theme.spacing(3),
    width: '80%',
    display: 'flex',
    height: 'auto',
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
    marginBottom: theme.spacing(1),
  },
}));

export interface ActionType {
  action: string;
  mergeId?: string;
}

interface Props {
  accountListId: string;
  setContactFocus: SetContactFocus;
}

const MergeContacts: React.FC<Props> = ({
  accountListId,
  setContactFocus,
}: Props) => {
  const { classes } = useStyles();
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useGetContactDuplicatesQuery({
    variables: { accountListId },
  });
  const { appName } = useGetAppSettings();
  const [contactsMerge, { loading: updating }] = useMassActionsMergeMutation();
  const disabled = useMemo(
    () => updating || Object.entries(actions).length === 0,
    [actions, updating],
  );
  const totalCount = data?.contactDuplicates.totalCount || 0;
  const showing = data?.contactDuplicates.nodes.length || 0;
  const MemoizedStickyConfirmButtons = memo(StickyConfirmButtons);

  const updateActions = (id1: string, id2: string, action: string): void => {
    if (!updating) {
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
    }
  };

  const mergeContacts = async () => {
    const mergeActions = Object.entries(actions).filter(
      (action) => action[1].action === 'merge',
    );
    if (mergeActions.length > 0) {
      const winnersAndLosers: { winnerId: string; loserId: string }[] =
        mergeActions.map((action) => {
          return { winnerId: action[0], loserId: action[1].mergeId || '' };
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
            cache.evict({ id: `Contact:${contact.loserId}` });
          });
          cache.gc();
        },
        onCompleted: () => {
          enqueueSnackbar(t('Success!'), {
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
          {showing > 0 ? (
            <>
              <Grid item xs={12}>
                <Box
                  className={classes.descriptionBox}
                  data-testid="ContactMergeDescription"
                >
                  <Typography>
                    <Trans
                      defaults="You have <bold>{{totalCount}}</bold> possible duplicate contacts. This is sometimes caused when you imported data into {{appName}}. We recommend reconciling these as soon as possible. Please select the duplicate that should win the merge. No data will be lost. "
                      shouldUnescape
                      values={{
                        totalCount,
                        appName,
                      }}
                      components={{ bold: <strong /> }}
                    />
                  </Typography>
                  <Typography>
                    <strong>{t('This cannot be undone.')}</strong>
                  </Typography>
                </Box>
              </Grid>
              <MemoizedStickyConfirmButtons
                accountListId={accountListId}
                loading={loading}
                updating={updating}
                showing={showing}
                disabled={disabled}
                totalCount={totalCount}
                confirmAction={mergeContacts}
                setActions={setActions}
              />
              <Grid item xs={12} sx={{ margin: '0px 2px 20px 2px' }}>
                {data?.contactDuplicates.nodes
                  .map((duplicate) => (
                    <ContactPair
                      key={duplicate.id}
                      contact1={duplicate.recordOne}
                      contact2={duplicate.recordTwo}
                      update={updateActions}
                      updating={updating}
                      setContactFocus={setContactFocus}
                    />
                  ))
                  .reverse()}
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
