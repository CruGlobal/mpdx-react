import React from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useHcmQuery } from '../HcmData/Hcm.generated';
import { useRefreshHcmMutation } from './RefreshHcm.generated';

interface HcmSyncStatusProps {
  /** The person whose HCM data the page shows. Defaults to the current user. */
  personNumber?: string;
}

/**
 * Shows how old the page's HCM data is, lets the user fetch it again from HCM now, and warns when
 * HCM no longer has a record for the person. Reads the same Hcm query the page already loaded,
 * so it adds no request of its own.
 */
export const HcmSyncStatus: React.FC<HcmSyncStatusProps> = ({
  personNumber,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const { data } = useHcmQuery({ variables: { personNumber } });
  const [refreshHcm, { loading: refreshing }] = useRefreshHcmMutation({
    refetchQueries: ['Hcm'],
    awaitRefetchQueries: true,
  });

  const person = data?.hcm[0];
  if (!person) {
    return null;
  }

  const updated = person.syncedAt
    ? DateTime.fromISO(person.syncedAt).toRelative({ locale })
    : null;

  const handleRefresh = () =>
    refreshHcm({
      variables: { personNumber },
      onCompleted: () => {
        enqueueSnackbar(t('HCM data refreshed.'), { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(error.message, { variant: 'error' });
      },
    });

  return (
    <Stack spacing={1} mb={2}>
      {person.outOfSync && (
        <Alert severity="warning">
          {t(
            'HCM no longer has a record for this person, so this information may be out of date. Please contact HR if this looks wrong.',
          )}
        </Alert>
      )}
      <Stack direction="row" alignItems="center" spacing={1}>
        {updated && (
          <Typography variant="body2" color="text.secondary">
            {t('HCM data updated {{updated}}', { updated })}
          </Typography>
        )}
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? t('Refreshing…') : t('Refresh')}
        </Button>
      </Stack>
    </Stack>
  );
};
