import React, { createContext, useContext, useEffect, useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  AlertTitle,
  Box,
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

const HcmSyncStatusContext = createContext<HcmSyncStatusProps | null>(null);

/**
 * Marks a page whose PanelLayout should show HcmSyncBodyStatus at the top of its main content.
 * PanelLayout positions its sidebar and sizes its main area from the header down, so anything
 * placed between the header and the layout is covered on narrow screens.
 */
export const HcmSyncStatusProvider: React.FC<
  React.PropsWithChildren<HcmSyncStatusProps>
> = ({ personNumber, children }) => (
  <HcmSyncStatusContext.Provider value={{ personNumber }}>
    {children}
  </HcmSyncStatusContext.Provider>
);

export const useHcmSyncStatusPlacement = () => useContext(HcmSyncStatusContext);

/** Reads the same Hcm query the page already loaded, so it adds no request of its own. */
const useHcmSync = (personNumber?: string) => {
  const { t } = useTranslation();
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
  const syncedAt = person?.syncedAt ? DateTime.fromISO(person.syncedAt) : null;

  const refresh = () =>
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

  return {
    person,
    syncedAt,
    stale: !!syncedAt && syncedAt < DateTime.now().minus(STALE_AFTER),
    refreshing,
    coolingDown,
    refresh,
  };
};

type HcmSync = ReturnType<typeof useHcmSync>;

const SyncRow: React.FC<{ sync: HcmSync }> = ({ sync }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { syncedAt, stale, refreshing, coolingDown, refresh } = sync;

  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      {syncedAt && (
        <Tooltip
          title={syncedAt.toLocaleString(DateTime.DATETIME_MED, { locale })}
        >
          <Typography
            variant="body2"
            color={stale ? 'warning.dark' : 'text.secondary'}
            noWrap
          >
            {t('Synced from HCM {{when}}', {
              when: syncedAt.toRelative({ locale, style: 'short' }),
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
            onClick={refresh}
            disabled={refreshing || coolingDown}
          >
            {refreshing ? t('Refreshing…') : t('Refresh')}
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
};

/**
 * When the page's HCM data was last synced, and a button to pull the latest. Goes in the page
 * header's rightExtra slot; on narrow screens the header has no room, so HcmSyncBodyStatus shows
 * the same row under the header instead.
 */
export const HcmSyncHeaderStatus: React.FC<HcmSyncStatusProps> = ({
  personNumber,
}) => {
  const sync = useHcmSync(personNumber);
  if (!sync.person) {
    return null;
  }

  return (
    <Box
      sx={{ display: { xs: 'none', md: 'block' } }}
      data-testid="HcmSyncHeaderStatus"
    >
      <SyncRow sync={sync} />
    </Box>
  );
};

/**
 * Goes at the top of the page body, under the header. Shows the sync row on narrow screens, and at
 * every width warns when HCM no longer has a record for the person.
 */
export const HcmSyncBodyStatus: React.FC<HcmSyncStatusProps> = ({
  personNumber,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const sync = useHcmSync(personNumber);
  const { person, syncedAt } = sync;
  if (!person) {
    return null;
  }

  return (
    <Stack
      spacing={1.5}
      sx={{
        mb: 3,
        display: person.outOfSync ? 'flex' : { xs: 'flex', md: 'none' },
      }}
      data-testid="HcmSyncBodyStatus"
    >
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <SyncRow sync={sync} />
      </Box>
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
    </Stack>
  );
};
