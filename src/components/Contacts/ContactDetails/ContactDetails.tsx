import { AppBar, Box, styled, Tab, Tabs } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import { ContactDetailsHeader } from './ContactDetailsHeader/ContactDetailsHeader';

interface Props {
  accountListId: string;
  contactId: string;
  onClose: () => void;
}

const ContactTabBar = styled(AppBar)(({}) => ({
  position: 'static',
  backgroundColor: theme.palette.common.white,
}));

const ContactTab = styled(Tab)(({}) => ({
  display: 'flex',
  flexShrink: 1,
  color: theme.palette.text.primary,
}));

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
      <ContactTabBar>
        <Tabs>
          <ContactTab label={t('Tasks')} />
          <ContactTab label={t('Donations')} />
          <ContactTab label={t('Referrals')} />
          <ContactTab label={t('Contact Details')} />
          <ContactTab label={t('Notes')} />
        </Tabs>
      </ContactTabBar>
    </Box>
  );
};
