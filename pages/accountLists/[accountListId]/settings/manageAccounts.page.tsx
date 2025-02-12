import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { ManageAccountAccessAccordion } from 'src/components/Settings/Accounts/ManageAccountAccess/ManageAccountAccessAccordion';
import { MergeAccountsAccordion } from 'src/components/Settings/Accounts/MergeAccounts/MergeAccountsAccordion';
import { MergeSpouseAccountsAccordion } from 'src/components/Settings/Accounts/MergeSpouseAccounts/MergeSpouseAccountsAccordion';
import { AccountAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { SettingsWrapper } from './Wrapper';

export const suggestedArticles = 'HS_SETTINGS_SERVICES_SUGGESTIONS';

const ManageAccounts = (): ReactElement => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const [expandedAccordion, setExpandedAccordion] =
    useState<AccountAccordion | null>(
      typeof query.selectedTab === 'string'
        ? (query.selectedTab as AccountAccordion)
        : AccountAccordion.ManageAccountAccess,
    );

  return (
    <SettingsWrapper
      pageTitle={t('Manage Accounts')}
      pageHeading={t('Manage Accounts')}
      selectedMenuId="manageAccounts"
    >
      <AccordionGroup title="">
        <ManageAccountAccessAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
        />

        <MergeAccountsAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
        />

        <MergeSpouseAccountsAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default ManageAccounts;
