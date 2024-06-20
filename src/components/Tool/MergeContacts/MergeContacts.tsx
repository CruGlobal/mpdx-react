import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
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
import { LoadingSpinner } from 'src/components/Settings/Organization/LoadingSpinner';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import NoData from '../NoData';
import ContactPair from './ContactPair';
import { useGetContactDuplicatesQuery } from './GetContactDuplicates.generated';

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
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
}));
const ButtonHeaderBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  backgroundColor: 'white',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'sticky',
  top: '64px',
  zIndex: '100',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.cruGrayLight.main,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'start',
    top: '56px',
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
  const totalCount = data?.contactDuplicates.totalCount || 0;
  const showing = data?.contactDuplicates.nodes.length || 0;

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
  const handleConfirmAndContinue = async () => {
    await mergeContacts();
    setActions({});
  };
  const handleConfirmAndLeave = async () => {
    await mergeContacts().then(() => {
      window.location.href = `${process.env.SITE_URL}/accountLists/${accountListId}/tools`;
      setActions({});
    });
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
      {(loading || updating) && (
        <LoadingSpinner firstLoad={true} data-testid="LoadingSpinner" />
      )}
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
              <ButtonHeaderBox>
                <Box>
                  <Typography>
                    <Trans
                      defaults="<i>Showing <bold>{{showing}}</bold> of <bold>{{totalCount}}</bold></i>"
                      shouldUnescape
                      values={{
                        showing,
                        totalCount,
                      }}
                      components={{ bold: <strong />, i: <i /> }}
                    />
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    disabled={disabled}
                    onClick={() => handleConfirmAndContinue()}
                    sx={{ mr: 2 }}
                  >
                    {t('Confirm and Continue')}
                  </Button>
                  <Button
                    variant="contained"
                    disabled={disabled}
                    onClick={() => handleConfirmAndLeave()}
                  >
                    {t('Confirm and Leave')}
                  </Button>
                </Box>
              </ButtonHeaderBox>
              <Grid item xs={12} sx={{ margin: '0px 2px 20px 2px' }}>
                {data?.contactDuplicates.nodes
                  .map((duplicate) => (
                    <ContactPair
                      key={duplicate.id}
                      contact1={duplicate.recordOne}
                      contact2={duplicate.recordTwo}
                      update={updateActions}
                      updating={updating}
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
