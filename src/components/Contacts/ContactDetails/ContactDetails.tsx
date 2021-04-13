import { AppBar, Box, styled, Tab, Tabs, withStyles } from '@material-ui/core';
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
  onChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}

const ContactAppBar = styled(AppBar)(({}) => ({
  position: 'static',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  borderBottom: '1px solid #DCDCDC',
}));

const ContactTabs = withStyles({
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
  minWidth: 72,
  marginRight: theme.spacing(4),
  color: theme.palette.text.primary,
  opacity: 0.75,
  '&:hover': { opacity: 1 },
}));

export const ContactDetails: React.FC<Props> = ({
  accountListId,
  contactId,
}: Props) => {
  const { t } = useTranslation();

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box position="fixed">
      <ContactDetailsHeader
        accountListId={accountListId}
        contactId={contactId}
      />
      <ContactAppBar>
        <ContactTabs value={value} onChange={handleChange}>
          <ContactTab label={t('Tasks')} />
          <ContactTab label={t('Donations')} />
          <ContactTab label={t('Referrals')} />
          <ContactTab label={t('Contact Details')} />
          <ContactTab label={t('Notes')} />
        </ContactTabs>
      </ContactAppBar>
    </Box>
  );
};
