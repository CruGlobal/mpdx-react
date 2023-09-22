import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsWrapper } from './wrapper';
import { suggestArticles } from 'src/lib/helpScout';
import { GetServerSideProps } from 'next';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { ImpersonateUserAccordian } from 'src/components/Settings/AdminConsole/ImpersonateUser/ImpersonateUserAccordian';
import { ResetAccountAccordian } from 'src/components/Settings/AdminConsole/ResetAccount/ResetAccountAccordian';
import { AddOfflineOrganizationAccordian } from 'src/components/Settings/AdminConsole/AddOfflineOrganization/AddOfflineOrganizationAccordian';

interface Props {
  selectedTab: string;
}

const Integrations = ({ selectedTab }: Props): ReactElement => {
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
      pageTitle={t('Admin Console')}
      pageHeading={t('Admin Console')}
      selectedMenuId="adminConsole"
    >
      <AccordionGroup title="">
        <ImpersonateUserAccordian
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />

        <ResetAccountAccordian
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
        <AddOfflineOrganizationAccordian
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

export default Integrations;
