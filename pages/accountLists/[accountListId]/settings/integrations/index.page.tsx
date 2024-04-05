import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { ChalklineAccordion } from 'src/components/Settings/integrations/Chalkline/ChalklineAccordion';
import { GoogleAccordion } from 'src/components/Settings/integrations/Google/GoogleAccordion';
import { TheKeyAccordion } from 'src/components/Settings/integrations/Key/TheKeyAccordion';
import { MailchimpAccordion } from 'src/components/Settings/integrations/Mailchimp/MailchimpAccordion';
import { OrganizationAccordion } from 'src/components/Settings/integrations/Organization/OrganizationAccordion';
import { PrayerlettersAccordion } from 'src/components/Settings/integrations/Prayerletters/PrayerlettersAccordion';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from '../Wrapper';

const Integrations: React.FC = () => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [expandedPanel, setExpandedPanel] = useState(
    (query?.selectedTab as string | undefined) || '',
  );

  useEffect(() => {
    suggestArticles('HS_SETTINGS_SERVICES_SUGGESTIONS');
  }, []);

  const handleAccordionChange = (panel: string) => {
    const panelLowercase = panel.toLowerCase();
    setExpandedPanel(expandedPanel === panelLowercase ? '' : panelLowercase);
  };

  return (
    <SettingsWrapper
      pageTitle={t('Connect Services')}
      pageHeading={t('Connect Services')}
      selectedMenuId="integrations"
    >
      <AccordionGroup title="">
        <TheKeyAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
        <OrganizationAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
      </AccordionGroup>
      <AccordionGroup title={t('External Services')}>
        <GoogleAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
        <MailchimpAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
        <PrayerlettersAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
        <ChalklineAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default Integrations;
