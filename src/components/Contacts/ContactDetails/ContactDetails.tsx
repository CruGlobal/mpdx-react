import { Box, styled, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import React from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import {
  ContactsPageContext,
  ContactsPageType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { ContactDetailsHeader } from './ContactDetailsHeader/ContactDetailsHeader';
import { ContactTasksTab } from './ContactTasksTab/ContactTasksTab';
import { ContactDetailsTab } from './ContactDetailsTab/ContactDetailsTab';
import { ContactDonationsTab } from './ContactDontationsTab/ContactDonationsTab';
import { ContactReferralTab } from './ContactReferralTab/ContactReferralTab';
import { ContactNotesTab } from './ContactNotesTab/ContactNotesTab';
import {
  ContactDetailContext,
  ContactDetailsType,
} from './ContactDetailContext';

interface Props {
  onClose: () => void;
}

const ContactDetailsWrapper = styled(Box)(({}) => ({
  width: '100%',
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

  const {
    accountListId,
    contactDetailsId: contactId,
    setContactFocus,
  } = React.useContext(ContactsPageContext) as ContactsPageType;

  const { selectedTabKey, handleTabChange: handleChange } = React.useContext(
    ContactDetailContext,
  ) as ContactDetailsType;

  return (
    <ContactDetailsWrapper>
      <ContactDetailsHeader
        accountListId={accountListId ?? ''}
        contactId={contactId ?? ''}
        onClose={onClose}
      />
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
        <TabPanel value={TabKey.Tasks}>
          <ContactTasksTab
            accountListId={accountListId ?? ''}
            contactId={contactId ?? ''}
          />
        </TabPanel>
        <TabPanel value={TabKey.Donations}>
          <ContactDonationsTab
            accountListId={accountListId ?? ''}
            contactId={contactId ?? ''}
          />
        </TabPanel>
        <TabPanel value={TabKey.Referrals}>
          <ContactReferralTab
            accountListId={accountListId ?? ''}
            contactId={contactId ?? ''}
            onContactSelected={setContactFocus}
          />
        </TabPanel>
        <TabPanel value={TabKey.ContactDetails}>
          <ContactDetailsTab
            accountListId={accountListId ?? ''}
            contactId={contactId ?? ''}
            onContactSelected={setContactFocus}
          />
        </TabPanel>
        <TabPanel value={TabKey.Notes}>
          <ContactNotesTab
            accountListId={accountListId ?? ''}
            contactId={contactId ?? ''}
          />
        </TabPanel>
      </TabContext>
    </ContactDetailsWrapper>
  );
};
