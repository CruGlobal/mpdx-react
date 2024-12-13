import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { ManageCoachesAccessAccordion } from 'src/components/Settings/Coaches/ManageCoachesAccess/ManageCoachesAccessAccordion';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { SettingsWrapper } from './Wrapper';

const ManageCoaching = (): ReactElement => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [expandedPanel, setExpandedPanel] = useState(
    typeof query.selectedTab === 'string'
      ? query.selectedTab
      : 'Manage Account Coaching Access',
  );

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
        <ManageCoachesAccessAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default ManageCoaching;
