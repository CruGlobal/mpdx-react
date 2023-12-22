import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';
import { getToken } from 'next-auth/jwt';
import { useTranslation } from 'react-i18next';
import { ChalklineAccordion } from 'src/components/Settings/integrations/Chalkline/ChalklineAccordion';
import { GoogleAccordion } from 'src/components/Settings/integrations/Google/GoogleAccordion';
import { TheKeyAccordion } from 'src/components/Settings/integrations/Key/TheKeyAccordion';
import { MailchimpAccordion } from 'src/components/Settings/integrations/Mailchimp/MailchimpAccordion';
import { OrganizationAccordion } from 'src/components/Settings/integrations/Organization/OrganizationAccordion';
import { PrayerlettersAccordion } from 'src/components/Settings/integrations/Prayerletters/PrayerlettersAccordion';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from '../wrapper';
import { IntegrationsContextProvider } from './IntegrationsContext';

interface Props {
  apiToken: string;
}

const Integrations = ({ apiToken }: Props): ReactElement => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [expandedPanel, setExpandedPanel] = useState(
    (query?.selectedTab as string) || '',
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
      <IntegrationsContextProvider apiToken={apiToken}>
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
      </IntegrationsContextProvider>
    </SettingsWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const jwtToken = (await getToken({
    req,
    secret: process.env.JWT_SECRET as string,
  })) as { apiToken: string } | null;
  const apiToken = jwtToken?.apiToken;

  return {
    props: {
      apiToken,
    },
  };
};

export default Integrations;
