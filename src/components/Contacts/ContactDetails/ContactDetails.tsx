import { AppBar, Box, Tab, Tabs } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContactDetailsHeader } from './ContactDetailsHeader/ContactDetailsHeader';

interface Props {
  accountListId: string;
  contactId: string;
  onClose: () => void;
}

export const ContactDetails: React.FC<Props> = ({
  accountListId,
  contactId,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Box position="fixed">
      <ContactDetailsHeader
        accountListId={accountListId}
        contactId={contactId}
      />
      <AppBar position="static">
        <Tabs>
          <Tab label={t('Tasks')} />
          <Tab label={t('Donations')} />
          <Tab label={t('Referrals')} />
          <Tab label={t('Contact Details')} />
          <Tab label={t('Notes')} />
        </Tabs>
      </AppBar>
    </Box>
  );
};
