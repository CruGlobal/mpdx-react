import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsWrapper } from './wrapper';
import { suggestArticles } from 'src/lib/helpScout';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { styled } from '@mui/material/styles';
import { Button, Typography, List, ListItemText, Alert } from '@mui/material';
import { StyledFormLabel } from '../../../../src/components/Shared/Forms/Field';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { TheKeyAccordian } from 'src/components/Settings/integrations/Key/TheKeyAccordian';
import { OrganizationAccordian } from 'src/components/Settings/integrations/Organization/OrganizationAccordian';
import { GoogleAccordian } from 'src/components/Settings/integrations/Google/GoogleAccordian';
import { MailchimpAccordian } from 'src/components/Settings/integrations/Mailchimp/MailchimpAccordian';

export const StyledListItem = styled(ListItemText)(() => ({
  display: 'list-item',
}));

export const StyledList = styled(List)(({ theme }) => ({
  listStyleType: 'disc',
  paddingLeft: theme.spacing(4),
}));

export const StyledServicesButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

interface Props {
  apiToken: string;
  selectedTab: string;
}

export type IntegrationsContextType = {
  apiToken: string;
};
export const IntegrationsContext =
  React.createContext<IntegrationsContextType | null>(null);

interface IntegrationsContextProviderProps {
  children: React.ReactNode;
  apiToken: string;
}
export const IntegrationsContextProvider: React.FC<
  IntegrationsContextProviderProps
> = ({ children, apiToken }) => {
  return (
    <IntegrationsContext.Provider value={{ apiToken }}>
      {children}
    </IntegrationsContext.Provider>
  );
};

const Integrations = ({ apiToken, selectedTab }: Props): ReactElement => {
  const { t } = useTranslation();
  const [expandedPanel, setExpandedPanel] = useState('');

  const [confirmingChalkLine, setConfirmingChalkLine] = useState(false);

  useEffect(() => {
    suggestArticles('HS_SETTINGS_SERVICES_SUGGESTIONS');
    setExpandedPanel(selectedTab);
  }, []);

  const handleAccordionChange = (panel: string) => {
    const panelLowercase = panel.toLowerCase();
    setExpandedPanel(expandedPanel === panelLowercase ? '' : panelLowercase);
  };

  const sendListToChalkLine = () => {
    // eslint-disable-next-line no-console
    console.log('Sending newsletter list to Chalk Line');

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('foo');
      }, 300);
    });
  };

  return (
    <SettingsWrapper
      pageTitle={t('Connect Services')}
      pageHeading={t('Connect Services')}
    >
      <IntegrationsContextProvider apiToken={apiToken}>
        <AccordionGroup title="">
          <TheKeyAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
          <OrganizationAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
        </AccordionGroup>
        <AccordionGroup title={t('External Services')}>
          <GoogleAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
          <MailchimpAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
          <AccordionItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label={t('prayerletters.com')}
            value={''}
            image={
              <img
                src="https://mpdx.org/567678cfd0a51220933a5b5b62aeae11.svg"
                alt="prayerletters.com"
              />
            }
          >
            <StyledFormLabel>PrayerLetters.com Overview</StyledFormLabel>
            <Typography>
              prayerletters.com is a significant way to save valuable ministry
              time while more effectively connecting with your partners. Keep
              your physical newsletter list up to date in MPDX and then sync it
              to your prayerletters.com account with this integration.
            </Typography>
            <Alert severity="info">
              By clicking &quot;Connect prayerletters.com Account&quot; you will
              replace your entire prayerletters.com list with what is in MPDX.
              Any contacts or information that are in your current
              prayerletters.com list that are not in MPDX will be deleted. We
              strongly recommend only making changes in MPDX.
            </Alert>
            <StyledServicesButton variant="outlined">
              {t('Connect prayerletters.com Account')}
            </StyledServicesButton>
          </AccordionItem>
          <AccordionItem
            onAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            label={t('Chalk Line')}
            value={''}
            image={
              <img
                src="https://mpdx.org/07717b2f3dbaa95197c268541bff97a6.png"
                alt="Chalk Line"
              />
            }
          >
            <StyledFormLabel>Chalk Line Overview</StyledFormLabel>
            <Typography>
              Chalkline is a significant way to save valuable ministry time
              while more effectively connecting with your partners. Send
              physical newsletters to your current list using Chalkline with a
              simple click. Chalkline is a one way send available anytime you’re
              ready to send a new newsletter out.
            </Typography>
            <StyledServicesButton
              variant="outlined"
              onClick={(event) => {
                event.preventDefault();
                setConfirmingChalkLine(true);
              }}
            >
              {t('Send my current Contacts to Chalk Line')}
            </StyledServicesButton>
          </AccordionItem>
        </AccordionGroup>
        <Confirmation
          isOpen={confirmingChalkLine}
          title={t('Confirm')}
          message={t(
            'Would you like MPDX to email Chalk Line your newsletter list and open their order form in a new tab?',
          )}
          handleClose={() => setConfirmingChalkLine(false)}
          mutation={sendListToChalkLine}
        />
      </IntegrationsContextProvider>
    </SettingsWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const session = await getSession({ req });
  const apiToken = session?.user.apiToken;
  const selectedTab = query?.selectedTab ?? '';

  return {
    props: {
      apiToken,
      selectedTab,
    },
  };
};

export default Integrations;
