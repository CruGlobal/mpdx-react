import {
  Box,
  CircularProgress,
  styled,
  Tab,
  Typography,
} from '@material-ui/core';
import { Skeleton, TabContext, TabList, TabPanel } from '@material-ui/lab';
import MUIDataTable, {
  MUIDataTableOptions,
  MUIDataTableColumn,
} from 'mui-datatables';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next/';
import { currencyFormat } from '../../../../lib/intlFormat';
import {
  GetContactDonationsQueryVariables,
  useGetContactDonationsQuery,
} from './ContactDonationsTab.generated';
import { DonationsGraph } from './DonationsGraph/DonationsGraph';

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

enum DonationTabKey {
  Donations = 'Donations',
  PartnershipInfo = 'Partnership Info',
}

export const ContactDonationsTab: React.FC<ContactDontationsProp> = ({
  accountListId,
  contactId,
}) => {
  const { data, loading } = useGetContactDonationsQuery({
    variables: { accountListId: accountListId, contactId: contactId },
  });

  const { t } = useTranslation();

  const [selectedDonationTabKey, setSelectedDonationTabKey] = React.useState(
    DonationTabKey.Donations,
  );

  const columns: MUIDataTableColumn[] = [
    {
      name: 'amount',
      label: t('Amount'),
      options: {
        filter: false,
        sort: true,
        customBodyRender: (amount, { rowIndex }): ReactElement => {
          const donation = data?.contact.donations.nodes[rowIndex];
          if (!loading && donation) {
            const {
              amount: { amount, currency },
            } = donation;
            return (
              <Typography variant="body1">
                {currencyFormat(amount, currency)}
              </Typography>
            );
          } else {
            return <Skeleton variant="circle" width={40} height={40} />;
          }
        },
      },
    },
    {
      name: 'amount.convertedAmount',
      label: t('Converted Amount'),
      options: {
        filter: false,
        sort: false,
        customBodyRender: (amount, { rowIndex }): ReactElement => {
          const donation = data?.contact.donations.nodes[rowIndex];
          if (!loading && donation) {
            const {
              amount: { convertedAmount, convertedCurrency },
            } = donation;
            return (
              <Typography variant="body1">
                {currencyFormat(convertedAmount, convertedCurrency)}
              </Typography>
            );
          } else {
            return <Skeleton variant="circle" width={40} height={40} />;
          }
        },
      },
    },
    {
      name: 'donationDate',
      label: t('Date'),
      options: { filter: false, sort: true },
    },
  ];

  const [currentPage, setCurrentPage] = useState(0);

  const options: MUIDataTableOptions = {
    serverSide: true,
    onChangePage: (newPage) => {
      setCurrentPage(newPage);
    },
    page: currentPage,
    count: data?.contact.donations.totalCount || 0,
    rowsPerPage: 25,
    rowsPerPageOptions: [25],
    fixedHeader: false,
    fixedSelectColumn: false,
    print: false,
    download: false,
    selectableRows: 'none',
    search: false,
  };

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
            <MUIDataTable
              title={loading && <CircularProgress size={24} />}
              data={
                loading || !data
                  ? [['', <Skeleton key={1} />]]
                  : data?.contact.donations.nodes
              }
              columns={columns}
              options={options}
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
            `The Partner Info for ${data?.contact.name} goes here`
          )}
        </TabPanel>
      </TabContext>
    </ContactDonationsContainer>
  );
};
