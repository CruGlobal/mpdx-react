import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CampaignIcon from '@mui/icons-material/Campaign';
import { Alert, Box, Button, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { useGetUsersOrganizationsAccountsQuery } from 'src/components/Settings/integrations/Organization/Organizations.generated';
import {
  useCanUserExportDataQuery,
  useGetAccountPreferencesQuery,
} from 'src/components/Settings/preferences/GetAccountPreferences.generated';
import { useGetPersonalPreferencesQuery } from 'src/components/Settings/preferences/GetPersonalPreferences.generated';
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
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGetTimezones } from 'src/hooks/useGetTimezones';
import { getCountries } from 'src/lib/data/countries';
import { suggestArticles } from 'src/lib/helpScout';
import theme from 'src/theme';
import { SettingsWrapper } from './Wrapper';

const AccordionLoading = styled(Skeleton)(() => ({
  width: '100%',
  height: '48px',
}));

const StickyBox = styled(Box)(() => ({
  position: 'sticky',
  top: theme.spacing(10),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
  height: theme.spacing(9),
  zIndex: '700',
  background: theme.palette.common.white,
  paddingY: 1,
}));

const Preferences: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() || '';
  const { push, query } = useRouter();

  const setupPositions = ['', 'locale', 'monthly_goal', 'home_country'];
  const accordionPanelPositions = [
    '',
    'locale',
    'monthly goal',
    'home country',
  ];
  const [setup, setSetup] = useState(0);
  const [expandedPanel, setExpandedPanel] = useState(
    typeof query.selectedTab === 'string' ? query.selectedTab : '',
  );
  const countries = getCountries();
  const timeZones = useGetTimezones();

  useEffect(() => {
    suggestArticles('HS_SETTINGS_PREFERENCES_SUGGESTIONS');
  }, []);

  const handleAccordionChange = (panel: string) => {
    const panelLowercase = panel.toLowerCase();
    setExpandedPanel(expandedPanel === panelLowercase ? '' : panelLowercase);
    if (setup > 0) {handleSetupChange();}
  };

  const handleSetupChange = async () => {
    const nextNav = setup + 1;
    if (setupPositions.length === nextNav) {
      setSetup(0);
      push(`/accountLists/${accountListId}/settings/notifications`);
    } else {
      setSetup(nextNav);
      setExpandedPanel(accordionPanelPositions[nextNav]);
      // push({
      //   pathname: pathname,
      //   query: {
      //     accountListId: accountListId,
      //     selectedTab: accordionPanelPositions[nextNav],
      //   },
      // });
    }
    // await updateUser({
    //   variables: {
    //     input: {
    //       attributes: {
    //         setup: position,
    //       },
    //     },
    //   },
    //   onCompleted: () => {
    //     enqueueSnackbar(t('Saved successfully.'), {
    //       variant: 'success',
    //     });
    //     handleAccordionChange(label);
    //   },
    //   onError: () => {
    //     enqueueSnackbar(t('Saving failed.'), {
    //       variant: 'error',
    //     });
    //   },
    // });
  };

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

  let setupData = personalPreferencesData?.user.setup;
  // TODO: get actual setup data
  setupData = 'locale';

  useEffect(() => {
    if (setupData && setupData !== 'finish') {
      const position = setupPositions.indexOf(setupData);
      setSetup(position);
      setExpandedPanel(accordionPanelPositions[position]);
    }
  }, [setupData]);

  return (
    <SettingsWrapper
      pageTitle={t('Preferences')}
      pageHeading={t('Preferences')}
      selectedMenuId={'preferences'}
    >
      <StickyBox>
        <Alert
          severity="info"
          variant="outlined"
          iconMapping={{
            info: <CampaignIcon fontSize="large" />,
          }}
          action={
            <Button variant="contained" onClick={handleSetupChange}>
              {t('Skip Step')}
            </Button>
          }
          sx={{ marginY: 2 }}
        >
          {setup === 1 && (
            <Typography variant="h6">{t("Let's set your locale!")}</Typography>
          )}
          {setup === 2 && (
            <Typography variant="h6">
              {t('Great progress comes from great goals!')}
            </Typography>
          )}
          {setup === 3 && (
            <Typography variant="h6">
              {t('What Country are you in?')}
            </Typography>
          )}
        </Alert>
      </StickyBox>
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
              disabled={!!setup}
            />
            <LocaleAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              localeDisplay={
                personalPreferencesData?.user?.preferences?.localeDisplay || ''
              }
              disabled={!!setup && setup !== 1}
            />
            <DefaultAccountAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              data={personalPreferencesData}
              accountListId={accountListId}
              defaultAccountList={
                personalPreferencesData?.user?.defaultAccountList || ''
              }
              disabled={!!setup}
            />
            <TimeZoneAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              timeZone={
                personalPreferencesData?.user?.preferences?.timeZone || ''
              }
              timeZones={timeZones}
              disabled={!!setup}
            />
            <HourToSendNotificationsAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              hourToSendNotifications={
                personalPreferencesData?.user?.preferences
                  ?.hourToSendNotifications || null
              }
              disabled={!!setup}
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
              disabled={!!setup}
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
              disabled={!!setup && setup !== 2}
            />
            <HomeCountryAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              homeCountry={
                accountPreferencesData?.accountList?.settings?.homeCountry || ''
              }
              accountListId={accountListId}
              countries={countries}
              disabled={!!setup && setup !== 3}
            />
            <CurrencyAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
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
                  organizations={userOrganizationAccountsData}
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
              tester={
                accountPreferencesData?.accountList?.settings?.tester || false
              }
              accountListId={accountListId}
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
              />
            )}
          </>
        )}
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default Preferences;
