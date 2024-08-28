import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { ManageAccountAccessAccordion } from 'src/components/Settings/Accounts/ManageAccountAccess/ManageAccountAccessAccordion';
import { MergeAccountsAccordion } from 'src/components/Settings/Accounts/MergeAccounts/MergeAccountsAccordion';
import { MergeSpouseAccountsAccordion } from 'src/components/Settings/Accounts/MergeSpouseAccounts/MergeSpouseAccountsAccordion';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { SettingsWrapper } from './Wrapper';

export const suggestedArticles = 'HS_SETTINGS_SERVICES_SUGGESTIONS';

const ManageAccounts = (): ReactElement => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [expandedPanel, setExpandedPanel] = useState(
    typeof query.selectedTab === 'string'
      ? query.selectedTab
      : 'Manage Account Access',
  );

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

export const getServerSideProps = loadSession;

export default ManageAccounts;
