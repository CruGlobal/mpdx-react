import { GetServerSideProps } from 'next';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { suggestArticles } from 'src/lib/helpScout';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { ManageAccountAccessAccordian } from 'src/components/Settings/Accounts/ManageAccountAccess/ManageAccountAccessAccordian';
import { MergeAccountsAccordian } from 'src/components/Settings/Accounts/MergeAccounts/MergeAccountsAccordian';
import { MergeSpouseAccountsAccordian } from 'src/components/Settings/Accounts/MergeSpouseAccounts/MergeSpouseAccountsAccordian';
import { SettingsWrapper } from './wrapper';

interface Props {
  selectedTab: string;
}

const ManageAccounts = ({ selectedTab }: Props): ReactElement => {
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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const selectedTab = query?.selectedTab ?? '';
  return {
    props: {
      selectedTab,
    },
  };
};

export default ManageAccounts;
