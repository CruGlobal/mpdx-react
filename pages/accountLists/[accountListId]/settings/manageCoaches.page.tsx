import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ManageCoachesAccessAccordian } from 'src/components/Settings/Coaches/ManageCoachesAccess/ManageCoachesAccessAccordian';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from './wrapper';

const ManageAccounts = (): ReactElement => {
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
      pageTitle={t('Manage Coaches')}
      pageHeading={t('Manage Coaches')}
      selectedMenuId="manageCoaches"
    >
      <AccordionGroup title="">
        <ManageCoachesAccessAccordian
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export default ManageAccounts;
