import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImpersonateUserAccordion } from 'src/components/Settings/Admin/ImpersonateUser/ImpersonateUserAccordion';
import { ResetAccountAccordion } from 'src/components/Settings/Admin/ResetAccount/ResetAccountAccordion';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from './wrapper';

export const suggestedArticles = 'HS_SETTINGS_SERVICES_SUGGESTIONS';

const Admin = (): ReactElement => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [expandedPanel, setExpandedPanel] = useState(
    typeof query.selectedTab === 'string'
      ? query.selectedTab
      : 'Impersonate User',
  );

  useEffect(() => {
    suggestArticles(suggestedArticles);
  }, []);

  const handleAccordionChange = (panel: string) => {
    const panelLowercase = panel.toLowerCase();
    setExpandedPanel(expandedPanel === panelLowercase ? '' : panelLowercase);
  };

  return (
    <SettingsWrapper
      pageTitle={t('Admin Console')}
      pageHeading={t('Admin Console')}
      selectedMenuId="admin"
    >
      <AccordionGroup title="">
        <ImpersonateUserAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />

        <ResetAccountAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export default Admin;
