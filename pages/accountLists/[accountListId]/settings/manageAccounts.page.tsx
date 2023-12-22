import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ManageAccountAccessAccordion } from 'src/components/Settings/Accounts/ManageAccountAccess/ManageAccountAccessAccordion';
import { MergeAccountsAccordion } from 'src/components/Settings/Accounts/MergeAccounts/MergeAccountsAccordion';
import { MergeSpouseAccountsAccordion } from 'src/components/Settings/Accounts/MergeSpouseAccounts/MergeSpouseAccountsAccordion';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from './Wrapper';

const ManageAccounts = (): ReactElement => {
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
      pageTitle={t('Manage Accounts')}
      pageHeading={t('Manage Accounts')}
      selectedMenuId="manageAccounts"
    >
      <AccordionGroup title="">
        <ManageAccountAccessAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />

        <MergeAccountsAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />

        <MergeSpouseAccountsAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export default ManageAccounts;
