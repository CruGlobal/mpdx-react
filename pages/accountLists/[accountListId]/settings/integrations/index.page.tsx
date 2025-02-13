import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { ChalklineAccordion } from 'src/components/Settings/integrations/Chalkline/ChalklineAccordion';
import { GoogleAccordion } from 'src/components/Settings/integrations/Google/GoogleAccordion';
import { MailchimpAccordion } from 'src/components/Settings/integrations/Mailchimp/MailchimpAccordion';
import { OktaAccordion } from 'src/components/Settings/integrations/Okta/OktaAccordion';
import { OrganizationAccordion } from 'src/components/Settings/integrations/Organization/OrganizationAccordion';
import { PrayerlettersAccordion } from 'src/components/Settings/integrations/Prayerletters/PrayerlettersAccordion';
import { SetupBanner } from 'src/components/Settings/preferences/SetupBanner';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import { IntegrationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { StickyBox } from 'src/components/Shared/Header/styledComponents';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUserPreference } from 'src/hooks/useUserPreference';
import { SettingsWrapper } from '../Wrapper';

const Integrations: React.FC = () => {
  const { t } = useTranslation();
  const { push, query } = useRouter();
  const [expandedAccordion, setExpandedAccordion] = useState(
    typeof query.selectedTab === 'string'
      ? (query.selectedTab as IntegrationAccordion)
      : null,
  );
  const accountListId = useAccountListId() || '';
  const { appName } = useGetAppSettings();
  const { onSetupTour } = useSetupContext();
  const [setup, setSetup] = useState(0);

  const setupAccordions = [
    IntegrationAccordion.Google,
    IntegrationAccordion.Mailchimp,
    IntegrationAccordion.Prayerletters,
  ];

  const [_, setSetupPosition] = useUserPreference({
    key: 'setup_position',
    defaultValue: '',
  });

  const handleSetupChange = async () => {
    if (!onSetupTour) {
      return;
    }
    const nextNav = setup + 1;

    if (setupAccordions.length === nextNav) {
      setSetupPosition('finish');
      push(`/accountLists/${accountListId}/setup/finish`);
    } else {
      setSetup(nextNav);
      setExpandedAccordion(setupAccordions[nextNav]);
    }
  };

  useEffect(() => {
    if (onSetupTour) {
      setExpandedAccordion(setupAccordions[0]);
    }
  }, [onSetupTour]);

  return (
    <SettingsWrapper
      pageTitle={t('Connect Services')}
      pageHeading={t('Connect Services')}
      selectedMenuId="integrations"
    >
      {onSetupTour && (
        <StickyBox>
          <SetupBanner
            button={
              <Button variant="contained" onClick={handleSetupChange}>
                {t('Next Step')}
              </Button>
            }
            title={t('Make {{appName}} a part of your everyday life', {
              appName,
            })}
          />
        </StickyBox>
      )}
      <AccordionGroup title="">
        <OktaAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
          disabled={onSetupTour}
        />
        <OrganizationAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
          disabled={onSetupTour}
        />
      </AccordionGroup>
      <AccordionGroup title={t('External Services')}>
        <GoogleAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
          disabled={onSetupTour && setup !== 0}
        />
        <MailchimpAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
          disabled={onSetupTour && setup !== 1}
        />
        <PrayerlettersAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
          disabled={onSetupTour && setup !== 2}
        />
        <ChalklineAccordion
          handleAccordionChange={setExpandedAccordion}
          expandedAccordion={expandedAccordion}
          disabled={onSetupTour}
        />
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default Integrations;
