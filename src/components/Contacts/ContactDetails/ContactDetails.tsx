import { Box, styled, Tab, Tabs } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import { ContactDetailsHeader } from './ContactDetailsHeader/ContactDetailsHeader';
import { ContactTasksTab } from './ContactTasksTab/ContactTasksTab';

interface Props {
  accountListId: string;
  contactId: string;
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

const ContactTabs = styled(Tabs)(({}) => ({
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

export const ContactDetails: React.FC<Props> = ({
  accountListId,
  contactId,
}: Props) => {
  const { t } = useTranslation();

  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const handleChange = (
    _event: React.ChangeEvent<Record<string, unknown>>,
    newIndex: number,
  ) => {
    setSelectedTabIndex(newIndex);
  };

  return (
    <ContactDetailsWrapper>
      <ContactDetailsHeader
        accountListId={accountListId}
        contactId={contactId}
      />
      <ContactTabsWrapper>
        <ContactTabs
          value={selectedTabIndex}
          onChange={handleChange}
          TabIndicatorProps={{ children: <span /> }}
        >
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
          <ContactTab label={t('Donations')} />
          <ContactTab label={t('Referrals')} />
          <ContactTab label={t('Contact Details')} />
          <ContactTab label={t('Notes')} />
        </ContactTabs>
      </ContactTabsWrapper>
    </ContactDetailsWrapper>
  );
};
