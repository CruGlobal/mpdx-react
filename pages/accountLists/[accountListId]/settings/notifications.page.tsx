import { useRouter } from 'next/router';
import React from 'react';
import { Box, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { useUpdateUserOptionsMutation } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { useGetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import { NotificationsTable } from 'src/components/Settings/notifications/NotificationsTable';
import { SetupBanner } from 'src/components/Settings/preferences/SetupBanner';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { SettingsWrapper } from './Wrapper';
import { StickyBox } from 'src/components/Shared/Header/styledComponents';

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const accountListId = useAccountListId() || '';
  const { push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { data: userOptions } = useGetUserOptionsQuery();
  const [updateUserOptions] = useUpdateUserOptionsMutation();

  const isSettingUp = userOptions?.userOptions.some(
    (option) =>
      option.key === 'setup_position' &&
      option.value === 'preferences.notifications',
  );

  const handleSetupChange = async () => {
    if (!isSettingUp) {
      return;
    }

    await updateUserOptions({
      variables: {
        key: 'setup_position',
        value: 'preferences.integrations',
      },
      onError: () => {
        enqueueSnackbar(t('Saving setup phase failed.'), {
          variant: 'error',
        });
      },
    });
    push(`/accountLists/${accountListId}/settings/integrations`);
  };

  return (
    <SettingsWrapper
      pageTitle={t('Notifications')}
      pageHeading={t('Notifications')}
      selectedMenuId="notifications"
    >
      {isSettingUp && (
        <StickyBox>
          <SetupBanner
            button={
              <Button variant="contained" onClick={handleSetupChange}>
                {t('Skip Step')}
              </Button>
            }
            title={t('Setup your notifications here')}
          />
        </StickyBox>
      )}
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
      <NotificationsTable handleSetupChange={handleSetupChange} />
    </SettingsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default Notifications;
