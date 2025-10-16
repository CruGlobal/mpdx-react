import React, { useState } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from '../../../theme';
import {
  ContactDetailContext,
  ContactDetailsType,
} from './ContactDetailContext';
import { ContactDetailTabEnum } from './ContactDetailTab';
import { ContactDetailsHeader } from './ContactDetailsHeader/ContactDetailsHeader';
import {
  DynamicContactDetailsTab,
  preloadContactDetailsTab,
} from './ContactDetailsTab/DynamicContactDetailsTab';
import {
  DynamicContactDonationsTab,
  preloadContactDonationsTab,
} from './ContactDonationsTab/DynamicContactDonationsTab';
import {
  DynamicContactNotesTab,
  preloadContactNotesTab,
} from './ContactNotesTab/DynamicContactNotesTab';
import {
  DynamicContactReferralTab,
  preloadContactReferralTab,
} from './ContactReferralTab/DynamicContactReferralTab';
import { ContactTasksTab } from './ContactTasksTab/ContactTasksTab';

const ContactDetailsWrapper = styled(Box)(({}) => ({
  width: '100%',
}));

const TabPanelNoBottomPadding = styled(TabPanel)(({ theme }) => ({
  paddingBottom: '0px',
  paddingInline: theme.spacing(2),
  '@media (max-width:500px)': {
    paddingInline: theme.spacing(0.5),
  },
}));

const ContactTabsWrapper = styled(Box)(({}) => ({
  width: '100%',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  borderBottom: '1px solid #DCDCDC',
}));

const ContactTabs = styled(TabList)(({}) => ({
  width: '100%',
  minHeight: 40,
  indicator: {
    display: 'flex',
    '& > span': {
      width: '100%',
      height: 2,
      backgroundColor: '#FFCF07',
    },
  },
}));

const ContactTab = styled(Tab)(({}) => ({
  textTransform: 'none',
  minWidth: 64,
  minHeight: 40,
  marginRight: theme.spacing(1),
  color: theme.palette.text.primary,
  opacity: 0.75,
  '&:hover': { opacity: 1 },
}));

export const ContactDetails: React.FC = () => {
  const { t } = useTranslation();
  const [contactDetailsLoaded, setContactDetailsLoaded] = useState(false);
  const accountListId = useAccountListId();
  const { openContactId: contactId } = useContactPanel();

  const { selectedTabKey, handleTabChange: handleChange } = React.useContext(
    ContactDetailContext,
  ) as ContactDetailsType;

  return (
    <ContactDetailsWrapper>
      {contactId && accountListId && (
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
          contactDetailsLoaded={contactDetailsLoaded}
          setContactDetailsLoaded={setContactDetailsLoaded}
        />
      )}
      <TabContext value={selectedTabKey}>
        <ContactTabsWrapper>
          <ContactTabs
            onChange={handleChange}
            TabIndicatorProps={{ children: <span /> }}
          >
            <ContactTab value={ContactDetailTabEnum.Tasks} label={t('Tasks')} />
            <ContactTab
              value={ContactDetailTabEnum.Donations}
              label={t('Donations')}
              onMouseEnter={preloadContactDonationsTab}
            />
            <ContactTab
              value={ContactDetailTabEnum.Referrals}
              label={t('Connections')}
              onMouseEnter={preloadContactReferralTab}
            />
            <ContactTab
              value={ContactDetailTabEnum.ContactDetails}
              label={t('Contact Details')}
              onMouseEnter={preloadContactDetailsTab}
            />
            <ContactTab
              value={ContactDetailTabEnum.Notes}
              label={t('Notes')}
              onMouseEnter={preloadContactNotesTab}
            />
          </ContactTabs>
        </ContactTabsWrapper>
        <TabPanelNoBottomPadding value={ContactDetailTabEnum.Tasks}>
          {contactId && accountListId && (
            <ContactTasksTab
              accountListId={accountListId}
              contactId={contactId}
              contactDetailsLoaded={contactDetailsLoaded}
            />
          )}
        </TabPanelNoBottomPadding>
        <TabPanel value={ContactDetailTabEnum.Donations}>
          {contactId && accountListId && (
            <DynamicContactDonationsTab
              accountListId={accountListId}
              contactId={contactId}
            />
          )}
        </TabPanel>
        <TabPanel value={ContactDetailTabEnum.Referrals}>
          {contactId && accountListId && (
            <DynamicContactReferralTab
              accountListId={accountListId}
              contactId={contactId}
            />
          )}
        </TabPanel>
        <TabPanel value={ContactDetailTabEnum.ContactDetails}>
          {contactId && accountListId && (
            <DynamicContactDetailsTab
              accountListId={accountListId}
              contactId={contactId}
            />
          )}
        </TabPanel>
        <TabPanel value={ContactDetailTabEnum.Notes}>
          {contactId && accountListId && (
            <DynamicContactNotesTab
              accountListId={accountListId}
              contactId={contactId}
            />
          )}
        </TabPanel>
      </TabContext>
    </ContactDetailsWrapper>
  );
};
