import React, { useState } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  AppealsContext,
  AppealsType,
} from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { ContactContextTypesEnum } from 'src/lib/contactContextTypes';
import theme from '../../../theme';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import {
  ContactDetailContext,
  ContactDetailsType,
} from './ContactDetailContext';
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

interface ContactDetailsProps {
  onClose: () => void;
  contextType?: ContactContextTypesEnum;
}

const ContactDetailsWrapper = styled(Box)(({}) => ({
  width: '100%',
}));

const TabPanelNoBottomPadding = styled(TabPanel)(({}) => ({
  paddingBottom: '0px',
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

export enum TabKey {
  Tasks = 'Tasks',
  Donations = 'Donations',
  Referrals = 'Referrals',
  ContactDetails = 'ContactDetails',
  Notes = 'Notes',
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({
  onClose,
  contextType = ContactContextTypesEnum.Contacts,
}) => {
  const { t } = useTranslation();
  const [contactDetailsLoaded, setContactDetailsLoaded] = useState(false);

  const {
    accountListId,
    contactDetailsId: contactId,
    setContactFocus,
  } = contextType === ContactContextTypesEnum.Contacts
    ? (React.useContext(ContactsContext) as ContactsType)
    : (React.useContext(AppealsContext) as AppealsType);

  const { selectedTabKey, handleTabChange: handleChange } = React.useContext(
    ContactDetailContext,
  ) as ContactDetailsType;

  return (
    <ContactDetailsWrapper>
      {contactId && accountListId && (
        <ContactDetailsHeader
          accountListId={accountListId}
          contactId={contactId}
          onClose={onClose}
          contactDetailsLoaded={contactDetailsLoaded}
          setContactDetailsLoaded={setContactDetailsLoaded}
          contextType={contextType}
        />
      )}
      <TabContext value={selectedTabKey}>
        <ContactTabsWrapper>
          <ContactTabs
            onChange={handleChange}
            TabIndicatorProps={{ children: <span /> }}
          >
            <ContactTab value={TabKey.Tasks} label={t('Tasks')} />
            <ContactTab
              value={TabKey.Donations}
              label={t('Donations')}
              onMouseEnter={preloadContactDonationsTab}
            />
            <ContactTab
              value={TabKey.Referrals}
              label={t('Referrals')}
              onMouseEnter={preloadContactReferralTab}
            />
            <ContactTab
              value={TabKey.ContactDetails}
              label={t('Contact Details')}
              onMouseEnter={preloadContactDetailsTab}
            />
            <ContactTab
              value={TabKey.Notes}
              label={t('Notes')}
              onMouseEnter={preloadContactNotesTab}
            />
          </ContactTabs>
        </ContactTabsWrapper>
        <TabPanelNoBottomPadding value={TabKey.Tasks}>
          {contactId && accountListId && (
            <ContactTasksTab
              accountListId={accountListId}
              contactId={contactId}
              contactDetailsLoaded={contactDetailsLoaded}
            />
          )}
        </TabPanelNoBottomPadding>
        <TabPanel value={TabKey.Donations}>
          {contactId && accountListId && (
            <DynamicContactDonationsTab
              accountListId={accountListId}
              contactId={contactId}
            />
          )}
        </TabPanel>
        <TabPanel value={TabKey.Referrals}>
          {contactId && accountListId && (
            <DynamicContactReferralTab
              accountListId={accountListId}
              contactId={contactId}
              onContactSelected={setContactFocus}
            />
          )}
        </TabPanel>
        <TabPanel value={TabKey.ContactDetails}>
          {contactId && accountListId && (
            <DynamicContactDetailsTab
              accountListId={accountListId}
              contactId={contactId}
              onContactSelected={setContactFocus}
            />
          )}
        </TabPanel>
        <TabPanel value={TabKey.Notes}>
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
