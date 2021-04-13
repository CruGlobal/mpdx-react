import { Box, styled, Tab, Tabs, withStyles } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import { ContactDetailsHeader } from './ContactDetailsHeader/ContactDetailsHeader';

interface Props {
  accountListId: string;
  contactId: string;
  onClose: () => void;
}

interface ContactTabsProps {
  value: number;
  onChange: (event: React.ChangeEvent, newIndex: number) => void;
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

const ContactTabs = withStyles({
  root: {
    width: '100%',
    minHeight: 40,
  },
  indicator: {
    display: 'flex',
    '& > span': {
      width: '100%',
      height: 2,
      backgroundColor: '#FFCF07',
    },
  },
})((props: ContactTabsProps) => (
  <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />
));

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

  const handleChange = (event: React.ChangeEvent, newIndex: number) => {
    setSelectedTabIndex(newIndex);
  };

  return (
    <ContactDetailsWrapper>
      <ContactDetailsHeader
        accountListId={accountListId}
        contactId={contactId}
      />
      <ContactTabsWrapper>
        <ContactTabs value={selectedTabIndex} onChange={handleChange}>
          <ContactTab label={t('Tasks')} />
          <ContactTab label={t('Donations')} />
          <ContactTab label={t('Referrals')} />
          <ContactTab label={t('Contact Details')} />
          <ContactTab label={t('Notes')} />
        </ContactTabs>
      </ContactTabsWrapper>
    </ContactDetailsWrapper>
  );
};
