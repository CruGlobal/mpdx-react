import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { ManageCoachesAccessAccordion } from 'src/components/Settings/Coaches/ManageCoachesAccess/ManageCoachesAccessAccordion';
import { CoachAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { SettingsWrapper } from './Wrapper';

const ManageCoaching = (): ReactElement => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [expandedAccordion, setExpandedAccordion] =
    useState<CoachAccordion | null>(
      typeof query.selectedTab === 'string'
        ? (query.selectedTab as CoachAccordion)
        : CoachAccordion.ManageCoachesAccess,
    );

  return (
    <SettingsWrapper
      pageTitle={t('Manage Coaches')}
      pageHeading={t('Manage Coaches')}
      selectedMenuId="manageCoaches"
    >
      <AccordionGroup title="">
        <ManageCoachesAccessAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default ManageCoaching;
