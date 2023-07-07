import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { SettingsWrapper } from './wrapper';
import { suggestArticles } from 'src/lib/helpScout';
import { NotificationsTable } from 'src/components/Settings/notifications/NotificationsTable';

const Preferences: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    suggestArticles('HS_SETTINGS_PREFERENCES_SUGGESTIONS');
  }, []);

  return (
    <SettingsWrapper
      pageTitle={t('Notifications')}
      pageHeading={t('Notifications')}
    >
      <Box component="section" marginTop={3}>
        <p>
          Based on an analysis of a partner&apos;s giving history, MPDX can
          notify you of events that you will probably want to follow up on. The
          detection logic is based on a set of rules that are right most of the
          time, but you will still want to verify an event manually before
          contacting the partner.
        </p>
      </Box>
      <Box component="section" marginTop={1}>
        <p>
          For each event MPDX can notify you via email and also create a task
          entry reminding you to do something about it. The options below allow
          you to control that behavior.
        </p>
      </Box>
      <NotificationsTable />
    </SettingsWrapper>
  );
};

export default Preferences;
