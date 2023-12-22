import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ManageAccountAccessAccordian } from 'src/components/Settings/Accounts/ManageAccountAccess/ManageAccountAccessAccordian';
import { MergeAccountsAccordian } from 'src/components/Settings/Accounts/MergeAccounts/MergeAccountsAccordian';
import { MergeSpouseAccountsAccordian } from 'src/components/Settings/Accounts/MergeSpouseAccounts/MergeSpouseAccountsAccordian';
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
      pageTitle={t('Manage Accounts')}
      pageHeading={t('Manage Accounts')}
      selectedMenuId="manageAccounts"
    >
      <AccordionGroup title="">
        <ManageAccountAccessAccordian
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />

        <MergeAccountsAccordian
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />

        <MergeSpouseAccountsAccordian
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export default ManageAccounts;
