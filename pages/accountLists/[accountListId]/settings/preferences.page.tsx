import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageAccordian } from 'src/components/Settings/preferences/LanguageAccordian/LanguageAccordian';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from './wrapper';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGetPreferencesQuery } from 'src/components/Settings/preferences/GetPreferences.generated';
import { LocaleAccordian } from 'src/components/Settings/preferences/accordions/LocaleAccordian/LocaleAccordian';
import { DefaultAccountAccordian } from 'src/components/Settings/preferences/accordions/DefaultAccountAccordian/DefaultAccountAccordian';
import { ProfileInfo } from 'src/components/Settings/preferences/info/ProfileInfo';

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

  const { data, loading } = useGetPreferencesQuery({
    variables: {
      accountListId: accountListId ?? '',
    },
  });

  return (
    <SettingsWrapper
      pageTitle={t('Preferences')}
      pageHeading={t('Preferences')}
    >
      <ProfileInfo accountListId={accountListId} data={data} />
      <AccordionGroup title="Personal Preferences">
        <LanguageAccordian
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={loading}
          data={data?.user?.preferences?.locale || ''}
        />
        <LocaleAccordian
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={loading}
          data={data?.user?.preferences?.localeDisplay || ''}
        />
        <DefaultAccountAccordian
          handleAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          loading={loading}
          data={data || {}}
          accountListId={accountListId}
        />
      </AccordionGroup>
      <AccordionGroup title="Account Preferences"></AccordionGroup>
    </SettingsWrapper>
  );
};

export default Preferences;
