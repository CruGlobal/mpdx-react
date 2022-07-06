import { Box, styled, Tab } from '@material-ui/core';
import { Skeleton, TabContext, TabList, TabPanel } from '@material-ui/lab';
import React from 'react';
import { useTranslation } from 'react-i18next/';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../ContactDetailContext';
import { ContactDonationsList } from './ContactDonationsList/ContactDonationsList';
import {
  GetContactDonationsQueryVariables,
  useGetContactDonationsQuery,
} from './ContactDonationsTab.generated';
import { DonationsGraph } from './DonationsGraph/DonationsGraph';
import { PartnershipInfo } from './PartnershipInfo/PartnershipInfo';

const ContactDonationsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0),
}));

const DonationsTabContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
  background: theme.palette.background.paper,
}));

const DonationsGraphContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const DonationsTabList = styled(TabList)(({}) => ({
  minHeight: 40,
}));

const DonationsTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 64,
  minHeight: 40,
  marginRight: theme.spacing(1),
  color: theme.palette.text.primary,
  opacity: 0.75,
  '&:hover': { opacity: 1 },
}));

const ContactDonationsLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

interface ContactDontationsProp {
  accountListId: string;
  contactId: string;
}

export type ContactDonationsFilter = Omit<
  GetContactDonationsQueryVariables,
  'accountListId'
>;

export enum DonationTabKey {
  Donations = 'Donations',
  PartnershipInfo = 'Partnership Info',
}

export const ContactDonationsTab: React.FC<ContactDontationsProp> = ({
  accountListId,
  contactId,
}) => {
  const { data, loading } = useGetContactDonationsQuery({
    variables: {
      accountListId: accountListId,
      contactId: contactId,
    },
  });

  const { t } = useTranslation();

  const {
    selectedDonationTabKey,
    setSelectedDonationTabKey,
  } = React.useContext(ContactDetailContext) as ContactDetailsType;

  const handleDonationTabChange = (
    _event: React.ChangeEvent<Record<string, unknown>>,
    newKey: DonationTabKey,
  ) => {
    setSelectedDonationTabKey(newKey);
  };
  return (
    <ContactDonationsContainer>
      <DonationsGraphContainer>
        {loading ? (
          <>
            <ContactDonationsLoadingPlaceHolder />
            <ContactDonationsLoadingPlaceHolder />
            <ContactDonationsLoadingPlaceHolder />
          </>
        ) : (
          <DonationsGraph
            accountListId={accountListId}
            donorAccountIds={
              data?.contact.contactDonorAccounts.nodes.map((donor) => {
                return donor.donorAccount.id;
              }) ?? []
            }
            convertedCurrency={
              data?.contact.lastDonation?.amount.convertedCurrency ?? ''
            }
          />
        )}
      </DonationsGraphContainer>
      <TabContext value={selectedDonationTabKey}>
        <DonationsTabContainer role="region">
          <DonationsTabList
            onChange={handleDonationTabChange}
            TabIndicatorProps={{ children: <span /> }}
          >
            <DonationsTab
              value={DonationTabKey.Donations}
              label={t('Donations')}
            />
            <DonationsTab
              value={DonationTabKey.PartnershipInfo}
              label={t('Partnership Info')}
            />
          </DonationsTabList>
        </DonationsTabContainer>
        <TabPanel value={DonationTabKey.Donations}>
          {loading ? (
            <>
              <ContactDonationsLoadingPlaceHolder />
              <ContactDonationsLoadingPlaceHolder />
              <ContactDonationsLoadingPlaceHolder />
            </>
          ) : (
            <ContactDonationsList
              accountListId={accountListId}
              contactId={contactId}
            />
          )}
        </TabPanel>
        <TabPanel value={DonationTabKey.PartnershipInfo}>
          {loading ? (
            <>
              <ContactDonationsLoadingPlaceHolder />
              <ContactDonationsLoadingPlaceHolder />
              <ContactDonationsLoadingPlaceHolder />
            </>
          ) : (
            <PartnershipInfo contact={data?.contact ?? null} />
          )}
        </TabPanel>
      </TabContext>
    </ContactDonationsContainer>
  );
};
