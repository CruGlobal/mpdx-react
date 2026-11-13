import React, { useState } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Tab } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useContactPanel } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useHorizontalScrollEdges } from 'src/hooks/useHorizontalScrollEdges';
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
}));

const ContactTabsWrapper = styled(Box)(({}) => ({
  position: 'relative',
  width: '100%',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  borderBottom: '1px solid #DCDCDC',
}));

// Fades the tabs out at an edge that has more tabs past it, so it's clear the
// row scrolls sideways. Matches the Tasks page tab row. From the sm breakpoint
// up, MUI shows its scroll arrow buttons instead, so the fades are hidden there.
const ContactTabsFade = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'side',
})<{ side: 'left' | 'right' }>(({ theme, side }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  ...(side === 'left' ? { left: 0 } : { right: 0 }),
  width: theme.spacing(5),
  pointerEvents: 'none',
  background: `linear-gradient(to ${side}, ${alpha(theme.palette.common.white, 0)}, ${theme.palette.common.white})`,
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
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
  const {
    scrollRef: tabsScrollRef,
    canScrollLeft: canScrollTabsLeft,
    canScrollRight: canScrollTabsRight,
  } = useHorizontalScrollEdges();

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
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ children: <span /> }}
            slotProps={{ scroller: { ref: tabsScrollRef } }}
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
          {canScrollTabsLeft && (
            <ContactTabsFade
              side="left"
              aria-hidden
              data-testid="ContactTabsFadeLeft"
            />
          )}
          {canScrollTabsRight && (
            <ContactTabsFade
              side="right"
              aria-hidden
              data-testid="ContactTabsFadeRight"
            />
          )}
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
