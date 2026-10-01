import React, { useEffect, useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { DateTime, Duration } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useHcmQuery } from '../HcmData/Hcm.generated';
import { useRefreshHcmMutation } from './RefreshHcm.generated';

/** Matches the API's limit of one refresh per person every 3 minutes. */
export const REFRESH_COOLDOWN = Duration.fromObject({ minutes: 3 });

/** The background sync revisits everyone well inside this, so older data means it has stalled. */
const STALE_AFTER = Duration.fromObject({ hours: 24 });

interface HcmSyncStatusProps {
  /** The person whose HCM data the page shows. Defaults to the current user. */
  personNumber?: string;
}

/**
 * Shows when the page's HCM data was last synced, lets the user pull the latest from HCM, and
 * warns when HCM no longer has a record for the person. Reads the same Hcm query the page
 * already loaded, so it adds no request of its own.
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
  const [coolingDown, setCoolingDown] = useState(false);

  useEffect(() => {
    if (!coolingDown) {
      return;
    }
    const timer = setTimeout(
      () => setCoolingDown(false),
      REFRESH_COOLDOWN.toMillis(),
    );
    return () => clearTimeout(timer);
  }, [coolingDown]);

  const person = data?.hcm[0];
  if (!person) {
    return null;
  }

  const syncedAt = person.syncedAt ? DateTime.fromISO(person.syncedAt) : null;
  const stale = !!syncedAt && syncedAt < DateTime.now().minus(STALE_AFTER);

  const handleRefresh = () =>
    refreshHcm({
      variables: { personNumber },
      onCompleted: () => {
        setCoolingDown(true);
        enqueueSnackbar(t('HCM data refreshed.'), { variant: 'success' });
      },
      onError: (error) => {
        const rateLimited = error.graphQLErrors.some(
          ({ extensions }) => extensions?.code === 'HCM_REFRESH_RATE_LIMITED',
        );
        if (rateLimited) {
          setCoolingDown(true);
        }
        enqueueSnackbar(error.message, {
          variant: rateLimited ? 'info' : 'error',
        });
      },
    });

  return (
    <Stack spacing={1.5}>
      {person.outOfSync && (
        <Alert severity="warning">
          <AlertTitle>
            {t('HCM no longer has a record for this person')}
          </AlertTitle>
          {syncedAt
            ? t(
                'The information below is from {{date}} and may be out of date. Please contact HR Services if this looks wrong.',
                {
                  date: syncedAt.toLocaleString(DateTime.DATE_MED, { locale }),
                },
              )
            : t(
                'The information below may be out of date. Please contact HR Services if this looks wrong.',
              )}
        </Alert>
      )}
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {syncedAt && (
          <Tooltip
            title={syncedAt.toLocaleString(DateTime.DATETIME_MED, { locale })}
          >
            <Typography
              variant="body2"
              color={stale ? 'warning.dark' : 'text.secondary'}
            >
              {t('Synced from HCM {{when}}', {
                when: syncedAt.toRelative({ locale }),
              })}
            </Typography>
          </Tooltip>
        )}
        <Tooltip
          title={
            coolingDown
              ? t('You can refresh again in a few minutes')
              : t('Get the latest information from HCM')
          }
        >
          {/* A disabled button fires no events, so the span keeps the tooltip working. */}
          <span>
            <Button
              size="small"
              variant="outlined"
              startIcon={
                refreshing ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={handleRefresh}
              disabled={refreshing || coolingDown}
            >
              {refreshing ? t('Refreshing…') : t('Refresh')}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
};
