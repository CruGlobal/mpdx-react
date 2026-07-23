import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enforceAdminOrCoach } from 'pages/api/utils/pagePropsHelpers';
import { ImpersonateUserAccordion } from 'src/components/Settings/Admin/ImpersonateUser/ImpersonateUserAccordion';
import { ResetAccountAccordion } from 'src/components/Settings/Admin/ResetAccount/ResetAccountAccordion';
import { AdminAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { SettingsWrapper } from './Wrapper';

export const suggestedArticles = 'HS_SETTINGS_SERVICES_SUGGESTIONS';

const Admin = (): ReactElement => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const user = useRequiredSession();
  const [expandedAccordion, setExpandedAccordion] =
    useState<AdminAccordion | null>(
      typeof query.selectedTab === 'string'
        ? (query.selectedTab as AdminAccordion)
        : AdminAccordion.ImpersonateUser,
    );

  return (
    <SettingsWrapper
      pageTitle={t('Admin Console')}
      pageHeading={t('Admin Console')}
      selectedMenuId="admin"
    >
      <AccordionGroup title="">
        <ImpersonateUserAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
        />

        {user.admin && (
          <ResetAccountAccordion
            handleAccordionChange={setExpandedAccordion}
            expandedAccordion={expandedAccordion}
          />
        )}
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = enforceAdminOrCoach;

export default Admin;
