import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { enforceAdminConsole } from 'pages/api/utils/pagePropsHelpers';
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
  const { admin, impersonating } = useRequiredSession();
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
        {impersonating ? (
          <Alert severity="info">
            {t('Stop impersonating before starting another impersonation.')}
          </Alert>
        ) : (
          <ImpersonateUserAccordion
            handleAccordionChange={setExpandedAccordion}
            expandedAccordion={expandedAccordion}
          />
        )}

        {admin && (
          <ResetAccountAccordion
            handleAccordionChange={setExpandedAccordion}
            expandedAccordion={expandedAccordion}
          />
        )}
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = enforceAdminConsole;

export default Admin;
