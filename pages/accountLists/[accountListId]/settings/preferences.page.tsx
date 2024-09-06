import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Box, Button, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { useUpdateUserOptionsMutation } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { useGetUsersOrganizationsAccountsQuery } from 'src/components/Settings/integrations/Organization/Organizations.generated';
import {
  useCanUserExportDataQuery,
  useGetAccountPreferencesQuery,
} from 'src/components/Settings/preferences/GetAccountPreferences.generated';
import { useGetPersonalPreferencesQuery } from 'src/components/Settings/preferences/GetPersonalPreferences.generated';
import { SetupBanner } from 'src/components/Settings/preferences/SetupBanner';
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
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { StickyBox } from 'src/components/Shared/Header/styledComponents';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGetTimezones } from 'src/hooks/useGetTimezones';
import { getCountries } from 'src/lib/data/countries';
import { suggestArticles } from 'src/lib/helpScout';
import { SettingsWrapper } from './Wrapper';

const AccordionLoading = styled(Skeleton)(() => ({
  width: '100%',
  height: '48px',
}));

const Preferences: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() || '';
  const { push, query } = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { settingUp } = useSetupContext();

  const setupAccordions = ['locale', 'monthly goal', 'home country'];
  const [setup, setSetup] = useState(0);
  const [expandedPanel, setExpandedPanel] = useState(
    typeof query.selectedTab === 'string' ? query.selectedTab : '',
  );
  const countries = getCountries();
  const timeZones = useGetTimezones();

  const [updateUserOptions] = useUpdateUserOptionsMutation();

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
  const { data: canUserExportData } = useCanUserExportDataQuery({
    variables: {
      accountListId: accountListId ?? '',
    },
  });

  const { data: userOrganizationAccountsData } =
    useGetUsersOrganizationsAccountsQuery();

  useEffect(() => {
    suggestArticles('HS_SETTINGS_PREFERENCES_SUGGESTIONS');
  }, []);

  useEffect(() => {
    if (settingUp) {
      setExpandedPanel(setupAccordions[0]);
    }
  }, [settingUp]);

  const handleAccordionChange = (panel: string) => {
    const panelLowercase = panel.toLowerCase();
    setExpandedPanel(expandedPanel === panelLowercase ? '' : panelLowercase);
  };

  const resetWelcomeTour = async () => {
    await updateUserOptions({
      variables: {
        key: 'setup_position',
        value: 'start',
      },
      onError: () => {
        enqueueSnackbar(t('Resetting the welcome tour failed.'), {
          variant: 'error',
        });
      },
    });
    push('/setup/start');
  };

  const handleSetupChange = async () => {
    if (!settingUp) {
      return;
    }
    const nextNav = setup + 1;

    if (setupAccordions.length === nextNav) {
      await updateUserOptions({
        variables: {
          key: 'setup_position',
          value: 'preferences.notifications',
        },
        onError: () => {
          enqueueSnackbar(t('Saving setup phase failed.'), {
            variant: 'error',
          });
        },
      });
      push(`/accountLists/${accountListId}/settings/notifications`);
    } else {
      setSetup(nextNav);
      setExpandedPanel(setupAccordions[nextNav]);
    }
  };

  const getSetupMessage = (setup: number) => {
    switch (setup) {
      case 0:
        return t("Let's set your locale!");
      case 1:
        return t('Great progress comes from great goals!');
      case 2:
        return t('What country are you in?');
      default:
        return '';
    }
  };

  return (
    <SettingsWrapper
      pageTitle={t('Preferences')}
      pageHeading={t('Preferences')}
      selectedMenuId={'preferences'}
    >
      {settingUp && (
        <StickyBox>
          <SetupBanner
            button={
              <Button variant="contained" onClick={handleSetupChange}>
                {t('Skip Step')}
              </Button>
            }
            title={getSetupMessage(setup)}
          />
        </StickyBox>
      )}
      <ProfileInfo accountListId={accountListId} />
      <AccordionGroup title={t('Personal Preferences')}>
        {personalPreferencesLoading && (
          <>
            <AccordionLoading />
            <AccordionLoading />
            <AccordionLoading />
            <AccordionLoading />
            <AccordionLoading />
          </>
        )}
        {!personalPreferencesLoading && (
          <>
            <LanguageAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              locale={personalPreferencesData?.user?.preferences?.locale || ''}
              disabled={settingUp}
            />
            <LocaleAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              localeDisplay={
                personalPreferencesData?.user?.preferences?.localeDisplay || ''
              }
              disabled={settingUp && setup !== 0}
              handleSetupChange={handleSetupChange}
            />
            <DefaultAccountAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              data={personalPreferencesData}
              accountListId={accountListId}
              defaultAccountList={
                personalPreferencesData?.user?.defaultAccountList || ''
              }
              disabled={settingUp}
            />
            <TimeZoneAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              timeZone={
                personalPreferencesData?.user?.preferences?.timeZone || ''
              }
              timeZones={timeZones}
              disabled={settingUp}
            />
            <HourToSendNotificationsAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              hourToSendNotifications={
                personalPreferencesData?.user?.preferences
                  ?.hourToSendNotifications || null
              }
              disabled={settingUp}
            />
          </>
        )}
      </AccordionGroup>
      <AccordionGroup title={t('Account Preferences')}>
        {accountPreferencesLoading && (
          <>
            <AccordionLoading />
            <AccordionLoading />
            <AccordionLoading />
            <AccordionLoading />
            <AccordionLoading />
          </>
        )}
        {!accountPreferencesLoading && (
          <>
            <AccountNameAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              name={accountPreferencesData?.accountList?.name || ''}
              accountListId={accountListId}
              disabled={settingUp}
            />
            <MonthlyGoalAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              monthlyGoal={
                accountPreferencesData?.accountList?.settings?.monthlyGoal ||
                null
              }
              accountListId={accountListId}
              currency={
                accountPreferencesData?.accountList?.settings?.currency || ''
              }
              disabled={settingUp && setup !== 1}
              handleSetupChange={handleSetupChange}
            />
            <HomeCountryAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              homeCountry={
                accountPreferencesData?.accountList?.settings?.homeCountry || ''
              }
              accountListId={accountListId}
              countries={countries}
              disabled={settingUp && setup !== 2}
              handleSetupChange={handleSetupChange}
            />
            <CurrencyAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              currency={
                accountPreferencesData?.accountList?.settings?.currency || ''
              }
              accountListId={accountListId}
              disabled={settingUp}
            />
            {userOrganizationAccountsData?.userOrganizationAccounts &&
              userOrganizationAccountsData?.userOrganizationAccounts?.length >
                1 && (
                <PrimaryOrgAccordion
                  handleAccordionChange={handleAccordionChange}
                  expandedPanel={expandedPanel}
                  organizations={userOrganizationAccountsData}
                  salaryOrganizationId={
                    accountPreferencesData?.accountList?.salaryOrganizationId ||
                    ''
                  }
                  accountListId={accountListId}
                  disabled={settingUp}
                />
              )}
            <EarlyAdopterAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              tester={
                accountPreferencesData?.accountList?.settings?.tester || false
              }
              accountListId={accountListId}
              disabled={settingUp}
            />
            <MpdInfoAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
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
              disabled={settingUp}
            />
            {canUserExportData?.canUserExportData.allowed && (
              <ExportAllDataAccordion
                handleAccordionChange={handleAccordionChange}
                expandedPanel={expandedPanel}
                exportedAt={
                  canUserExportData?.canUserExportData.exportedAt || undefined
                }
                accountListId={accountListId}
                data={personalPreferencesData}
                disabled={settingUp}
              />
            )}
          </>
        )}
      </AccordionGroup>
      <Box sx={{ overflow: 'auto' }}>
        <Button
          sx={{ float: 'right', marginTop: 2, marginBottom: 6 }}
          variant="outlined"
          onClick={resetWelcomeTour}
        >
          {t('Reset Welcome Tour')}
        </Button>
      </Box>
    </SettingsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default Preferences;
