import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import NoData from '../NoData';
import Contact from './Contact';
import { useGetContactDuplicatesQuery } from './GetContactDuplicates.generated';

const useStyles = makeStyles()(() => ({
  container: {
    padding: theme.spacing(3),
    width: '70%',
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      width: '80%',
    },
    [theme.breakpoints.down('sm')]: {
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
  confirmButton: {
    backgroundColor: theme.palette.mpdxBlue.main,
    width: 200,
    color: 'white',
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
  const { data, loading } = useGetContactDuplicatesQuery({
    variables: { accountListId },
  });
  const { appName } = useGetAppSettings();

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

  const testFnc = (): void => {
    for (const [id, action] of Object.entries(actions)) {
      switch (action.action) {
        case 'merge':
          // eslint-disable-next-line no-console
          console.log(`Merging ${id} with ${action.mergeId}`);
          break;
        case 'delete':
          // eslint-disable-next-line no-console
          console.log(`Deleting ${id}`);
          break;
        default:
          break;
      }
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
                <Box className={classes.descriptionBox}>
                  <Typography>
                    {t(
                      'You have {{amount}} possible duplicate contacts. This is sometimes caused when you imported data into {{appName}}. We recommend reconciling these as soon as possible. Please select the duplicate that should win the merge. No data will be lost. ',
                      {
                        amount: data?.contactDuplicates.nodes.length,
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
                    onClick={() => testFnc()}
                    className={classes.confirmButton}
                  >
                    {t('Confirm and Continue')}
                  </Button>
                  <Box ml={2} mr={2}>
                    <Typography>
                      <strong>{t('OR')}</strong>
                    </Typography>
                  </Box>
                  <Button className={classes.confirmButton}>
                    {t('Confirm and Leave')}
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box className={classes.footer}>
                  <Typography>
                    <Trans
                      defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                      shouldUnescape
                      values={{ value: data?.contactDuplicates.nodes.length }}
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
