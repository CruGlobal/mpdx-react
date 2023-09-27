import { GetServerSideProps } from 'next';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { suggestArticles } from 'src/lib/helpScout';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { SettingsWrapper } from './wrapper';
import { ManageCoachesAccessAccordian } from 'src/components/Settings/Coaches/ManageCoachesAccess/ManageCoachesAccessAccordian';

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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const selectedTab = query?.selectedTab ?? '';
  return {
    props: {
      selectedTab,
    },
  };
};

export default ManageAccounts;
