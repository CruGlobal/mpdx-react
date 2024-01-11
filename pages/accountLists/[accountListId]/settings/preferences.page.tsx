import React, { useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetUsersOrganizationsQuery } from 'src/components/Settings/integrations/Organization/Organizations.generated';
import {
  useGetAccountPreferencesQuery,
  useGetUserInCruOrgQuery,
} from 'src/components/Settings/preferences/GetAccountPreferences.generated';
import { useGetPersonalPreferencesQuery } from 'src/components/Settings/preferences/GetPersonalPreferences.generated';
import { useGetProfileInfoQuery } from 'src/components/Settings/preferences/GetProfileInfo.generated';
import { AccountNameAccordion } from 'src/components/Settings/preferences/accordions/AccountNameAccordion/AccountNameAccordion';
import { CurrencyAccordion } from 'src/components/Settings/preferences/accordions/CurrencyAccordion/CurrencyAccordion';
import { DefaultAccountAccordion } from 'src/components/Settings/preferences/accordions/DefaultAccountAccordion/DefaultAccountAccordion';
import { EarlyAdopterAccordion } from 'src/components/Settings/preferences/accordions/EarlyAdopterAccordion/EarlyAdopterAccordion';
import { ExportAllDataAccordion } from 'src/components/Settings/preferences/accordions/ExportAllDataAccordion/ExportAllDataAccordion';
import { HomeCountryAccordion } from 'src/components/Settings/preferences/accordions/HomeCountryAccordion/HomeCountryAccordion';
import { HourToSendNotificationsAccordion } from 'src/components/Settings/preferences/accordions/HourToSendNotificationsAccordion/HourToSendNotificationsAccordion';
import { LanguageAccordion } from 'src/components/Settings/preferences/accordions/LanguageAccordion/LanguageAccordion';
import { LocaleAccordion } from 'src/components/Settings/preferences/accordions/LocaleAccordion/LocaleAccordion';
import { MonthlyGoalAccordion } from 'src/components/Settings/preferences/accordions/MonthlyGoalAccordion/MonthlyGoalAccordion';
import { MpdInfoAccordion } from 'src/components/Settings/preferences/accordions/MpdInfoAccordion/MpdInfoAccordion';
import { PrimaryOrgAccordion } from 'src/components/Settings/preferences/accordions/PrimaryOrgAccordion/PrimaryOrgAccordion';
import { TimeZoneAccordion } from 'src/components/Settings/preferences/accordions/TimeZoneAccordion/TimeZoneAccordion';
import { ProfileInfo } from 'src/components/Settings/preferences/info/ProfileInfo';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { Person } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from './wrapper';

const Preferences: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() || '';
  const [expandedPanel, setExpandedPanel] = useState('');

  useEffect(() => {
    suggestArticles('HS_SETTINGS_PREFERENCES_SUGGESTIONS');
  }, []);

  const handleAccordionChange = (panel: string) => {
    const panelLowercase = panel.toLowerCase();
    setExpandedPanel(expandedPanel === panelLowercase ? '' : panelLowercase);
  };

  const { data: profileInfoData, loading: profileInfoLoading } =
    useGetProfileInfoQuery();

  const { data: personalPreferencesData, loading: personalPreferencesLoading } =
    useGetPersonalPreferencesQuery({
      variables: {
        accountListId: accountListId ?? '',
      },
    });

  const { data: accountPreferencesData, loading: accountPreferencesLoading } =
    useGetAccountPreferencesQuery({
      variables: {
        accountListId: accountListId ?? '',
      },
    });
  const { data: getUserInCruOrgData } = useGetUserInCruOrgQuery({
    variables: {
      accountListId: accountListId ?? '',
    },
  });

  const {
    data: userOrganizationAccountsData,
    loading: userOrganizationAccountsLoading,
  } = useGetUsersOrganizationsQuery();

  return (
    <SettingsWrapper
      pageTitle={t('Preferences')}
      pageHeading={t('Preferences')}
    >
      <ProfileInfo
        accountListId={accountListId}
        user={{ ...profileInfoData?.user, __typename: 'Person' } as Person}
        loading={profileInfoLoading}
      />
      <AccordionGroup title="Personal Preferences">
        {personalPreferencesLoading && <Skeleton height="240px" />}
        {!personalPreferencesLoading && (
          <>
            <LanguageAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={personalPreferencesLoading}
              locale={personalPreferencesData?.user?.preferences?.locale || ''}
            />
            <LocaleAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={personalPreferencesLoading}
              localeDisplay={
                personalPreferencesData?.user?.preferences?.localeDisplay || ''
              }
            />
            <DefaultAccountAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={personalPreferencesLoading}
              data={personalPreferencesData}
              accountListId={accountListId}
              defaultAccountList={
                personalPreferencesData?.user?.defaultAccountList || ''
              }
            />
            <TimeZoneAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={personalPreferencesLoading}
              timeZone={
                personalPreferencesData?.user?.preferences?.timeZone || ''
              }
            />
            <HourToSendNotificationsAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={personalPreferencesLoading}
              hourToSendNotifications={
                personalPreferencesData?.user?.preferences
                  ?.hourToSendNotifications || null
              }
            />
          </>
        )}
      </AccordionGroup>
      <AccordionGroup title="Account Preferences">
        {accountPreferencesLoading && <Skeleton height="336px" />}
        {!accountPreferencesLoading && (
          <>
            <AccountNameAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={accountPreferencesLoading}
              name={accountPreferencesData?.accountList?.name || ''}
              accountListId={accountListId}
            />
            <MonthlyGoalAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={accountPreferencesLoading}
              monthlyGoal={
                accountPreferencesData?.accountList?.settings?.monthlyGoal ||
                null
              }
              accountListId={accountListId}
              currency={
                accountPreferencesData?.accountList?.settings?.currency || ''
              }
            />
            <HomeCountryAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={accountPreferencesLoading}
              homeCountry={
                accountPreferencesData?.accountList?.settings?.homeCountry || ''
              }
              accountListId={accountListId}
            />
            <CurrencyAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={accountPreferencesLoading}
              currency={
                accountPreferencesData?.accountList?.settings?.currency || ''
              }
              accountListId={accountListId}
            />
            {userOrganizationAccountsData?.userOrganizationAccounts &&
              userOrganizationAccountsData?.userOrganizationAccounts?.length >
                1 && (
                <PrimaryOrgAccordion
                  handleAccordionChange={handleAccordionChange}
                  expandedPanel={expandedPanel}
                  loading={userOrganizationAccountsLoading}
                  organizations={userOrganizationAccountsData || []}
                  salaryOrganizationId={
                    accountPreferencesData?.accountList?.salaryOrganizationId ||
                    ''
                  }
                  accountListId={accountListId}
                />
              )}
            <EarlyAdopterAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={accountPreferencesLoading}
              tester={
                accountPreferencesData?.accountList?.settings?.tester || false
              }
              accountListId={accountListId}
            />
            <MpdInfoAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              loading={accountPreferencesLoading}
              activeMpdStartAt={
                accountPreferencesData?.accountList?.activeMpdStartAt || ''
              }
              activeMpdFinishAt={
                accountPreferencesData?.accountList?.activeMpdFinishAt || ''
              }
              activeMpdMonthlyGoal={
                accountPreferencesData?.accountList?.activeMpdMonthlyGoal ||
                null
              }
              currency={
                accountPreferencesData?.accountList?.settings?.currency || ''
              }
              accountListId={accountListId}
            />
            {getUserInCruOrgData?.getUserInCruOrg.allowed && (
              <ExportAllDataAccordion
                handleAccordionChange={handleAccordionChange}
                expandedPanel={expandedPanel}
                loading={accountPreferencesLoading}
                exportedAt={
                  getUserInCruOrgData?.getUserInCruOrg.exportedAt || undefined
                }
                accountListId={accountListId}
                data={personalPreferencesData}
              />
            )}
          </>
        )}
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export default Preferences;
