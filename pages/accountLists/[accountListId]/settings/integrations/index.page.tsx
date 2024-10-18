import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
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
import { useSavedPreference } from 'src/hooks/useSavedPreference';
import { SettingsWrapper } from '../Wrapper';

const Integrations: React.FC = () => {
  const { t } = useTranslation();
  const { push, query } = useRouter();
  const [expandedPanel, setExpandedPanel] = useState(
    (query?.selectedTab as string | undefined) || '',
  );
  const accountListId = useAccountListId() || '';
  const { appName } = useGetAppSettings();
  const { onSetupTour } = useSetupContext();
  const [setup, setSetup] = useState(0);

  const setupAccordions = ['google', 'mailchimp', 'prayerletters.com'];

  const [_, setSetupPosition] = useSavedPreference({
    key: 'setup_position',
    defaultValue: '',
  });

  const handleSetupChange = async () => {
    if (!onSetupTour) {
      return;
    }
    const nextNav = setup + 1;

    if (setupAccordions.length === nextNav) {
      setSetupPosition('finish');
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
    if (onSetupTour) {
      setExpandedPanel(setupAccordions[0]);
    }
  }, [onSetupTour]);

  return (
    <SettingsWrapper
      pageTitle={t('Connect Services')}
      pageHeading={t('Connect Services')}
      selectedMenuId="integrations"
    >
      {onSetupTour && (
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
          disabled={onSetupTour}
        />
        <OrganizationAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={onSetupTour}
        />
      </AccordionGroup>
      <AccordionGroup title={t('External Services')}>
        <GoogleAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={onSetupTour && setup !== 0}
        />
        <MailchimpAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={onSetupTour && setup !== 1}
        />
        <PrayerlettersAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={onSetupTour && setup !== 2}
        />
        <ChalklineAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          disabled={onSetupTour}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default Integrations;
