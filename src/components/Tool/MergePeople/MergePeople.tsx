import React, { useMemo, useState } from 'react';
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
import { TypeEnum } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import ContactPair from '../MergeContacts/ContactPair';
import { StickyConfirmButtons } from '../MergeContacts/StickyConfirmButtons';
import NoData from '../NoData';
import {
  useGetPersonDuplicatesQuery,
  useMergePeopleBulkMutation,
  useUpdateDuplicateMutation,
} from './GetPersonDuplicates.generated';

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

const MergePeople: React.FC<Props> = ({
  accountListId,
  setContactFocus,
}: Props) => {
  const { classes } = useStyles();
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useGetPersonDuplicatesQuery({
    variables: { accountListId },
  });
  const { appName } = useGetAppSettings();
  const [peopleMerge, { loading: updating }] = useMergePeopleBulkMutation();
  const [updateDuplicates] = useUpdateDuplicateMutation();
  const disabled = useMemo(
    () => updating || !Object.entries(actions).length,
    [actions, updating],
  );
  const totalCount = data?.personDuplicates.totalCount || 0;
  const duplicatesDisplayedCount = data?.personDuplicates.nodes.length || 0;

  const updateActions = (
    id1: string,
    id2: string,
    duplicateId: string,
    action: string,
  ): void => {
    if (!updating) {
      if (action === 'ignore') {
        setActions((prevState) => ({
          ...prevState,
          [id1]: { action: '' },
          [id2]: { action: '' },
          [duplicateId]: { action: 'ignore' },
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

  const handleBulkUpdateDuplicates = async () => {
    try {
      const callsByDuplicate: (() => Promise<{ success: boolean }>)[] = [];

      const mergeActions = Object.entries(actions).filter(
        (action) => action[1].action === 'merge',
      );

      if (mergeActions.length) {
        const winnersAndLosers: { winnerId: string; loserId: string }[] =
          mergeActions.map((action) => {
            return { winnerId: action[0], loserId: action[1].mergeId || '' };
          });

        const callMergeDuplicatesMutation = () =>
          mergeDuplicates(winnersAndLosers);
        callsByDuplicate.push(callMergeDuplicatesMutation);
      }

      const duplicatesToIgnore = Object.entries(actions)
        .filter((action) => action[1].action === 'ignore')
        .map((action) => action[0]);

      if (duplicatesToIgnore.length) {
        duplicatesToIgnore.forEach((duplicateId) => {
          const callIgnoreDuplicateMutation = () =>
            ignoreDuplicates(duplicateId);
          callsByDuplicate.push(callIgnoreDuplicateMutation);
        });
      }

      if (callsByDuplicate.length) {
        const results = await Promise.all(
          callsByDuplicate.map((call) => call()),
        );

        const failedUpdates = results.filter(
          (result) => !result.success,
        ).length;
        const successfulUpdates = results.length - failedUpdates;

        if (successfulUpdates) {
          enqueueSnackbar(t(`Updated ${successfulUpdates} duplicate(s)`), {
            variant: 'success',
          });
        }
        if (failedUpdates) {
          enqueueSnackbar(
            t(`Error when updating ${failedUpdates} duplicate(s)`),
            {
              variant: 'error',
            },
          );
        }
      } else {
        enqueueSnackbar(t(`No duplicates were updated`), {
          variant: 'warning',
        });
      }
    } catch (error) {
      enqueueSnackbar(t(`Error updating duplicates`), { variant: 'error' });
    }
  };

  const ignoreDuplicates = async (duplicateId: string) => {
    await updateDuplicates({
      variables: {
        input: {
          attributes: {
            ignore: true,
          },
          type: TypeEnum.Person,
          id: duplicateId,
        },
      },
      update: (cache) => {
        // Delete the duplicate
        cache.evict({ id: `PersonDuplicate:${duplicateId}` });
        cache.gc();
      },
      onError: () => {
        return { success: false };
      },
    });
    return { success: true };
  };

  const mergeDuplicates = async (winnersAndLosers) => {
    await peopleMerge({
      variables: {
        input: {
          winnersAndLosers,
        },
      },
      update: (cache) => {
        // Delete the people and remove dangling references to them
        winnersAndLosers.forEach((person) => {
          cache.evict({ id: `Person:${person.loserId}` });
        });
        cache.gc();
      },
      onError: () => {
        return { success: false };
      },
    });
    return { success: true };
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
            <Typography variant="h4">{t('Merge People')}</Typography>
            <Divider className={classes.divider} />
          </Grid>
          {duplicatesDisplayedCount ? (
            <>
              <Grid item xs={12}>
                <Box
                  className={classes.descriptionBox}
                  data-testid="PeopleMergeDescription"
                >
                  <Typography>
                    <Trans
                      defaults="You have <bold>{{totalCount}}</bold> possible duplicate people. This is sometimes caused when you imported data into {{appName}}. We recommend reconciling these as soon as possible. Please select the duplicate that should win the merge. No data will be lost. "
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
              <StickyConfirmButtons
                accountListId={accountListId}
                loading={loading}
                updating={updating}
                duplicatesDisplayedCount={duplicatesDisplayedCount}
                disabled={disabled}
                totalCount={totalCount}
                confirmAction={handleBulkUpdateDuplicates}
                setActions={setActions}
              />
              <Grid item xs={12} sx={{ margin: '0px 2px 20px 2px' }}>
                {data?.personDuplicates.nodes.map((duplicate) => (
                  <ContactPair
                    key={duplicate.id}
                    duplicateId={duplicate.id}
                    contact1={duplicate.recordOne}
                    contact2={duplicate.recordTwo}
                    update={updateActions}
                    updating={updating}
                    setContactFocus={setContactFocus}
                  />
                ))}
              </Grid>
            </>
          ) : (
            <NoData tool="mergePeople" />
          )}
        </Grid>
      ) : (
        <CircularProgress style={{ marginTop: theme.spacing(3) }} />
      )}
    </Box>
  );
};

export default MergePeople;
