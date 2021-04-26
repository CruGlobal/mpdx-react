import { Box, styled, Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import React from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import { ContactDetailsHeader } from './ContactDetailsHeader/ContactDetailsHeader';
import { ContactDetailsTab } from './ContactDetailsTab/ContactDetailsTab';

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

export const ContactDetails: React.FC<Props> = ({
  accountListId,
  contactId,
}: Props) => {
  const { t } = useTranslation();

  const [selectedTabIndex, setSelectedTabIndex] = React.useState('0');

  const handleChange = (
    _event: React.ChangeEvent<Record<string, unknown>>,
    newIndex: string,
  ) => {
    setSelectedTabIndex(newIndex);
  };

  return (
    <ContactDetailsWrapper>
      <ContactDetailsHeader
        accountListId={accountListId}
        contactId={contactId}
      />
      <TabContext value={selectedTabIndex}>
        <ContactTabsWrapper>
          <ContactTabs
            onChange={handleChange}
            TabIndicatorProps={{ children: <span /> }}
          >
            <ContactTab value="0" label={t('Tasks')} />
            <ContactTab value="1" label={t('Donations')} />
            <ContactTab value="2" label={t('Referrals')} />
            <ContactTab value="3" label={t('Contact Details')} />
            <ContactTab value="4" label={t('Notes')} />
          </ContactTabs>
        </ContactTabsWrapper>
        <TabPanel value="0">{t('Tasks')}</TabPanel>
        <TabPanel value="1">{t('Donations')}</TabPanel>
        <TabPanel value="2">{t('Referrals')}</TabPanel>
        <TabPanel value="3">
          <ContactDetailsTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </TabPanel>
        <TabPanel value="4">{t('Notes')}</TabPanel>
      </TabContext>
    </ContactDetailsWrapper>
  );
};
