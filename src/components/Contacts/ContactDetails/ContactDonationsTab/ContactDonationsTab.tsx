import React from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Skeleton, Tab, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next/';
import { DonationTable } from 'src/components/DonationTable/DonationTable';
import { EmptyDonationsTable } from 'src/components/common/EmptyDonationsTable/EmptyDonationsTable';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../ContactDetailContext';
import {
  GetContactDonationsQueryVariables,
  useGetContactDonationsQuery,
} from './ContactDonationsTab.generated';
import { DonationTabKey } from './DonationTabKey';
import { DonationsGraph } from './DonationsGraph/DonationsGraph';
import { PartnershipInfo } from './PartnershipInfo/PartnershipInfo';

const ContactDonationsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0),
}));

const DonationsTabContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  background: theme.palette.background.paper,
  borderBottom: '1px solid #DCDCDC',
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

const PartnershipInfoLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '20em',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

const StyledTabPanel = styled(TabPanel)({
  padding: 0,
});

interface ContactDonationsProp {
  accountListId: string;
  contactId: string;
}

export type ContactDonationsFilter = Omit<
  GetContactDonationsQueryVariables,
  'accountListId'
>;

export const ContactDonationsTab: React.FC<ContactDonationsProp> = ({
  accountListId,
  contactId,
}) => {
  const { data } = useGetContactDonationsQuery({
    variables: {
      accountListId: accountListId,
      contactId: contactId,
    },
  });
  const donorAccountIds = data?.contact.contactDonorAccounts.nodes.map(
    (donor) => donor.donorAccount.id,
  );

  const { t } = useTranslation();

  const { selectedDonationTabKey, setSelectedDonationTabKey } =
    React.useContext(ContactDetailContext) as ContactDetailsType;

  const handleDonationTabChange = (
    _event: React.ChangeEvent<Record<string, unknown>>,
    newKey: DonationTabKey,
  ) => {
    setSelectedDonationTabKey(newKey);
  };
  return (
    <ContactDonationsContainer>
      <DonationsGraph
        accountListId={accountListId}
        donorAccountIds={donorAccountIds}
        convertedCurrency={data?.contact.lastDonation?.amount.convertedCurrency}
      />
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
        <StyledTabPanel value={DonationTabKey.Donations}>
          <DonationTable
            accountListId={accountListId}
            filter={{ donorAccountIds }}
            loading={!donorAccountIds}
            emptyPlaceholder={
              <EmptyDonationsTable
                title={t('No donations received for {{name}}', {
                  name: data?.contact.name,
                })}
              />
            }
            visibleColumnsStorageKey="contact-donations"
            hideDisplayName={true}
          />
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            {t(`On smaller screens, some columns may be hidden. Please scroll
            horizontally to view all the data.`)}
          </Typography>
        </StyledTabPanel>
        <StyledTabPanel value={DonationTabKey.PartnershipInfo}>
          {!data ? (
            new Array(10)
              .fill(null)
              .map((_, index) => (
                <PartnershipInfoLoadingPlaceHolder key={index} />
              ))
          ) : (
            <PartnershipInfo contact={data.contact} />
          )}
        </StyledTabPanel>
      </TabContext>
    </ContactDonationsContainer>
  );
};
