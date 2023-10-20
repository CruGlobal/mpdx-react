import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageAccordion } from 'src/components/Settings/preferences/accordions/LanguageAccordion/LanguageAccordion';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from './wrapper';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { LocaleAccordion } from 'src/components/Settings/preferences/accordions/LocaleAccordion/LocaleAccordion';
import { DefaultAccountAccordion } from 'src/components/Settings/preferences/accordions/DefaultAccountAccordion/DefaultAccountAccordion';
import { ProfileInfo } from 'src/components/Settings/preferences/info/ProfileInfo';
import { useGetPersonalPreferencesQuery } from 'src/components/Settings/preferences/GetPersonalPreferences.generated';
import { useGetAccountPreferencesQuery } from 'src/components/Settings/preferences/GetAccountPreferences.generated';
import { useGetProfileInfoQuery } from 'src/components/Settings/preferences/GetProfileInfo.generated';
import { TimeZoneAccordion } from 'src/components/Settings/preferences/accordions/TimeZoneAccordion/TimeZoneAccordion';
import { HourToSendNotificationsAccordion } from 'src/components/Settings/preferences/accordions/HourToSendNotificationsAccordion/HourToSendNotificationsAccordion';
import { AccountNameAccordion } from 'src/components/Settings/preferences/accordions/AccountNameAccordion/AccountNameAccordion';
import { MonthlyGoalAccordion } from 'src/components/Settings/preferences/accordions/MonthlyGoalAccordion/MonthlyGoalAccordion';
import { HomeCountryAccordion } from 'src/components/Settings/preferences/accordions/HomeCountryAccordion/HomeCountryAccordion';
import { CurrencyAccordion } from 'src/components/Settings/preferences/accordions/CurrencyAccordion/CurrencyAccordion';

const Preferences: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() || '';
  const [expandedPanel, setExpandedPanel] = useState('');
  //const constants = useApiConstants();
  //const languages = constants?.languages ?? [];

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

  return (
    <SettingsWrapper
      pageTitle={t('Preferences')}
      pageHeading={t('Preferences')}
    >
      <ProfileInfo
        accountListId={accountListId}
        data={profileInfoData}
        loading={profileInfoLoading}
      />
      <AccordionGroup title="Personal Preferences">
        <LanguageAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={personalPreferencesLoading}
          data={personalPreferencesData?.user}
          accountListId={accountListId}
        />
        <LocaleAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={personalPreferencesLoading}
          data={personalPreferencesData?.user}
        />
        <DefaultAccountAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={personalPreferencesLoading}
          data={personalPreferencesData}
          accountListId={accountListId}
        />
        <TimeZoneAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={personalPreferencesLoading}
          data={personalPreferencesData?.user}
          accountListId={accountListId}
        />
        <HourToSendNotificationsAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={personalPreferencesLoading}
          data={personalPreferencesData?.user}
          accountListId={accountListId}
        />
      </AccordionGroup>
      <AccordionGroup title="Account Preferences">
        <AccountNameAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={accountPreferencesLoading}
          data={accountPreferencesData}
          accountListId={accountListId}
        />
        <MonthlyGoalAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={accountPreferencesLoading}
          data={accountPreferencesData}
          accountListId={accountListId}
        />
        <HomeCountryAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={accountPreferencesLoading}
          data={accountPreferencesData}
          accountListId={accountListId}
        />
        <CurrencyAccordion
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={accountPreferencesLoading}
          data={accountPreferencesData}
          accountListId={accountListId}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export default Preferences;
