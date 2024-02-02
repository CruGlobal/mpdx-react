import React, { useState } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  ContactsContext,
  ContactsType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsContext';
import theme from '../../../theme';
import {
  ContactDetailContext,
  ContactDetailsType,
} from './ContactDetailContext';
import { ContactDetailsHeader } from './ContactDetailsHeader/ContactDetailsHeader';
import { ContactDetailsTab } from './ContactDetailsTab/ContactDetailsTab';
import { ContactDonationsTab } from './ContactDonationsTab/ContactDonationsTab';
import { ContactNotesTab } from './ContactNotesTab/ContactNotesTab';
import { ContactReferralTab } from './ContactReferralTab/ContactReferralTab';
import { ContactTasksTab } from './ContactTasksTab/ContactTasksTab';

interface Props {
  onClose: () => void;
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

export const ContactDetails: React.FC<Props> = ({ onClose }) => {
  const { t } = useTranslation();
  const [contactDetailsLoaded, setContactDetailsLoaded] = useState(false);

  const {
    accountListId,
    contactDetailsId: contactId,
    setContactFocus,
  } = React.useContext(ContactsContext) as ContactsType;

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
        />
      )}
      <TabContext value={selectedTabKey}>
        <ContactTabsWrapper>
          <ContactTabs
            onChange={handleChange}
            TabIndicatorProps={{ children: <span /> }}
          >
            <ContactTab value={TabKey.Tasks} label={t('Tasks')} />
            <ContactTab value={TabKey.Donations} label={t('Donations')} />
            <ContactTab value={TabKey.Referrals} label={t('Referrals')} />
            <ContactTab
              value={TabKey.ContactDetails}
              label={t('Contact Details')}
            />
            <ContactTab value={TabKey.Notes} label={t('Notes')} />
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
            <ContactDonationsTab
              accountListId={accountListId}
              contactId={contactId}
            />
          )}
        </TabPanel>
        <TabPanel value={TabKey.Referrals}>
          <ContactReferralTab
            accountListId={accountListId ?? ''}
            contactId={contactId ?? ''}
            onContactSelected={setContactFocus}
          />
        </TabPanel>
        <TabPanel value={TabKey.ContactDetails}>
          {contactId && accountListId && (
            <ContactDetailsTab
              accountListId={accountListId}
              contactId={contactId}
              onContactSelected={setContactFocus}
            />
          )}
        </TabPanel>
        <TabPanel value={TabKey.Notes}>
          {contactId && accountListId && (
            <ContactNotesTab
              accountListId={accountListId}
              contactId={contactId}
            />
          )}
        </TabPanel>
      </TabContext>
    </ContactDetailsWrapper>
  );
};
