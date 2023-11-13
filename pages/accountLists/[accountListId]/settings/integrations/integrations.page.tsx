import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';
import { suggestArticles } from 'src/lib/helpScout';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { TheKeyAccordian } from 'src/components/Settings/integrations/Key/TheKeyAccordian';
import { OrganizationAccordian } from 'src/components/Settings/integrations/Organization/OrganizationAccordian';
import { GoogleAccordian } from 'src/components/Settings/integrations/Google/GoogleAccordian';
import { MailchimpAccordian } from 'src/components/Settings/integrations/Mailchimp/MailchimpAccordian';
import { PrayerlettersAccordian } from 'src/components/Settings/integrations/Prayerletters/PrayerlettersAccordian';
import { ChalklineAccordian } from 'src/components/Settings/integrations/Chalkline/ChalklineAccordian';
import { SettingsWrapper } from '../wrapper';
import { IntegrationsContextProvider } from './integrationsContext';

interface Props {
  apiToken: string;
  selectedTab: string;
}

const Integrations = ({ apiToken, selectedTab }: Props): ReactElement => {
  const { t } = useTranslation();
  const [expandedPanel, setExpandedPanel] = useState('');

  useEffect(() => {
    suggestArticles('HS_SETTINGS_SERVICES_SUGGESTIONS');
    setExpandedPanel(selectedTab);
  }, []);

  const handleAccordionChange = (panel: string) => {
    const panelLowercase = panel.toLowerCase();
    setExpandedPanel(expandedPanel === panelLowercase ? '' : panelLowercase);
  };

  return (
    <SettingsWrapper
      pageTitle={t('Connect Services')}
      pageHeading={t('Connect Services')}
    >
      <IntegrationsContextProvider apiToken={apiToken}>
        <AccordionGroup title="">
          <TheKeyAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
          <OrganizationAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
        </AccordionGroup>
        <AccordionGroup title={t('External Services')}>
          <GoogleAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
          <MailchimpAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
          <PrayerlettersAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
          <ChalklineAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
        </AccordionGroup>
      </IntegrationsContextProvider>
    </SettingsWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const jwtToken = (await getToken({
    req,
    secret: process.env.JWT_SECRET as string,
  })) as { apiToken: string } | null;

  const apiToken = jwtToken?.apiToken;
  const selectedTab = query?.selectedTab ?? '';

  return {
    props: {
      apiToken,
      selectedTab,
    },
  };
};

export default Integrations;
