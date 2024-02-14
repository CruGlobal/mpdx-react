import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NotificationsTable } from 'src/components/Settings/notifications/NotificationsTable';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { SettingsWrapper } from './wrapper';

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  return (
    <SettingsWrapper
      pageTitle={t('Notifications')}
      pageHeading={t('Notifications')}
      selectedMenuId="notifications"
    >
      <Box component="section" marginTop={3}>
        <p>
          {t(
            `Based on an analysis of a partner's giving history, {{appName}} can
          notify you of events that you will probably want to follow up on. The
          detection logic is based on a set of rules that are right most of the
          time, but you will still want to verify an event manually before
          contacting the partner.`,
            { appName },
          )}
        </p>
      </Box>
      <Box component="section" marginTop={1}>
        <p>
          {t(
            `For each event {{appName}} can notify you via email and also create a task
          entry reminding you to do something about it. The options below allow
          you to control that behavior.`,
            { appName },
          )}
        </p>
      </Box>
      <NotificationsTable />
    </SettingsWrapper>
  );
};

export default Notifications;
