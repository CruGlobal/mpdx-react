import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsWrapper } from './wrapper';
import { suggestArticles } from 'src/lib/helpScout';

import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { styled } from '@mui/material/styles';
import { Button, Typography, List, ListItemText, Alert } from '@mui/material';
import { StyledFormLabel } from '../../../../src/components/Shared/Forms/Field';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { TheKeyAccordian } from 'src/components/Settings/connectServices/TheKeyAccordian';
import { OrganizationAccordian } from 'src/components/Settings/connectServices/Organization/OrganizationAccordian';

const StyledListItem = styled(ListItemText)(() => ({
  display: 'list-item',
}));

const StyledList = styled(List)(({ theme }) => ({
  listStyleType: 'disc',
  paddingLeft: theme.spacing(4),
}));

const StyledServicesButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ConnectServices: React.FC = () => {
  const { t } = useTranslation();
  const [expandedPanel, setExpandedPanel] = useState('');
  // const [isValid, setIsValid] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmingChalkLine, setConfirmingChalkLine] = useState(false);

  useEffect(() => {
    suggestArticles('HS_SETTINGS_SERVICES_SUGGESTIONS');
  }, []);

  const handleAccordionChange = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? '' : panel);
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
      <AccordionGroup title={t('')}>
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
        <AccordionItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('Google')}
          value={''}
          image={
            <img
              src="https://mpdx.org/77c26b7f4808b300a0fd19e292884395.png"
              alt="Google"
            />
          }
        >
          <StyledFormLabel>Google Integration Overview</StyledFormLabel>
          <Typography>
            Google’s suite of tools are great at connecting you to your Ministry
            Partners.
          </Typography>
          <Typography mt={2}>
            By synchronizing your Google services with MPDX, you will be able
            to:
          </Typography>
          <StyledList>
            <StyledListItem>
              See MPDX tasks in your Google Calendar
            </StyledListItem>
            <StyledListItem>Import Google Contacts into MPDX</StyledListItem>
            <StyledListItem>
              Keep your Contacts in sync with your Google Contacts
            </StyledListItem>
          </StyledList>
          <Typography>
            Connect your Google account to begin, and then setup specific
            settings for Google Calendar and Contacts. MPDX leaves you in
            control of how each service stays in sync.
          </Typography>
          <StyledServicesButton variant="outlined">
            {t('Add Account')}
          </StyledServicesButton>
        </AccordionItem>
        <AccordionItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          label={t('MailChimp')}
          value={''}
          image={
            <img
              src="https://mpdx.org/122cd92a3b2a7fadaf77541750e172aa.svg"
              alt="MailChimp"
            />
          }
        >
          <StyledFormLabel>MailChimp Overview</StyledFormLabel>
          <Typography>
            MailChimp makes keeping in touch with your ministry partners easy
            and streamlined. Here’s how it works:
          </Typography>
          <StyledList sx={{ listStyleType: 'number' }}>
            <StyledListItem>
              If you have an existing MailChimp list you’d like to use, Great!
              Or, create a new one for your MPDX connection.
            </StyledListItem>
            <StyledListItem>
              Select your MPDX MailChimp list to stream your MPDX contacts into.
            </StyledListItem>
          </StyledList>
          <Typography>
            That&apos;s it! Set it and leave it! Now your MailChimp list is
            continuously up to date with your MPDX Contacts. That&apos;s just
            the surface. Click over to the MPDX Help site for more in-depth
            details.
          </Typography>
          <StyledServicesButton variant="outlined">
            {t('Connect MailChimp')}
          </StyledServicesButton>
        </AccordionItem>
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
            time while more effectively connecting with your partners. Keep your
            physical newsletter list up to date in MPDX and then sync it to your
            prayerletters.com account with this integration.
          </Typography>
          <Alert severity="info">
            By clicking &quot;Connect prayerletters.com Account&quot; you will
            replace your entire prayerletters.com list with what is in MPDX. Any
            contacts or information that are in your current prayerletters.com
            list that are not in MPDX will be deleted. We strongly recommend
            only making changes in MPDX.
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
            Chalkline is a significant way to save valuable ministry time while
            more effectively connecting with your partners. Send physical
            newsletters to your current list using Chalkline with a simple
            click. Chalkline is a one way send available anytime you’re ready to
            send a new newsletter out.
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
    </SettingsWrapper>
  );
};

export default ConnectServices;
