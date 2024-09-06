import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { useUpdateUserOptionsMutation } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { ChalklineAccordion } from 'src/components/Settings/integrations/Chalkline/ChalklineAccordion';
import { GoogleAccordion } from 'src/components/Settings/integrations/Google/GoogleAccordion';
import { TheKeyAccordion } from 'src/components/Settings/integrations/Key/TheKeyAccordion';
import { MailchimpAccordion } from 'src/components/Settings/integrations/Mailchimp/MailchimpAccordion';
import { OrganizationAccordion } from 'src/components/Settings/integrations/Organization/OrganizationAccordion';
import { PrayerlettersAccordion } from 'src/components/Settings/integrations/Prayerletters/PrayerlettersAccordion';
import { SetupBanner } from 'src/components/Settings/preferences/SetupBanner';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { StickyBox } from 'src/components/Shared/Header/styledComponents';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from '../Wrapper';

const Integrations: React.FC = () => {
  const { t } = useTranslation();
  const { push, query } = useRouter();
  const [expandedPanel, setExpandedPanel] = useState(
    (query?.selectedTab as string | undefined) || '',
  );
  const accountListId = useAccountListId() || '';
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { settingUp } = useSetupContext();
  const [setup, setSetup] = useState(0);

  const setupAccordions = ['google', 'mailchimp', 'prayerletters.com'];

  const [updateUserOptions] = useUpdateUserOptionsMutation();

  const handleSetupChange = async () => {
    if (!settingUp) {
      return;
    }
    const nextNav = setup + 1;

    if (setupAccordions.length === nextNav) {
      await updateUserOptions({
        variables: {
          key: 'setup_position',
          value: 'finish',
        },
        onError: () => {
          enqueueSnackbar(t('Saving setup phase failed.'), {
            variant: 'error',
          });
        },
      });
      push(`/accountLists/${accountListId}/setup/finish`);
    } else {
      setSetup(nextNav);
      setExpandedPanel(setupAccordions[nextNav]);
    }
  };

  const handleAccordionChange = (panel: string) => {
    const panelLowercase = panel.toLowerCase();
    setExpandedPanel(expandedPanel === panelLowercase ? '' : panelLowercase);
  };
  useEffect(() => {
    suggestArticles('HS_SETTINGS_SERVICES_SUGGESTIONS');
  }, []);

  useEffect(() => {
    if (settingUp) {
      setExpandedPanel(setupAccordions[0]);
    }
  }, [settingUp]);

  return (
    <SettingsWrapper
      pageTitle={t('Connect Services')}
      pageHeading={t('Connect Services')}
      selectedMenuId="integrations"
    >
      {settingUp && (
        <StickyBox>
          <SetupBanner
            button={
              <Button variant="contained" onClick={handleSetupChange}>
                {t('Next Step')}
              </Button>
            }
            title={t('Make {{appName}} a part of your everyday life', {
              appName,
            })}
          />
        </StickyBox>
      )}
      <AccordionGroup title="">
        <TheKeyAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={settingUp}
        />
        <OrganizationAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={settingUp}
        />
      </AccordionGroup>
      <AccordionGroup title={t('External Services')}>
        <GoogleAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={settingUp && setup !== 0}
        />
        <MailchimpAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={settingUp && setup !== 1}
        />
        <PrayerlettersAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={settingUp && setup !== 2}
        />
        <ChalklineAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={settingUp}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default Integrations;
