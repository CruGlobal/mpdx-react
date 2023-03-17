import {
  Box,
  Button,
  Table,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { DateTime } from 'luxon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { currencyFormat } from '../../../../../lib/intlFormat/intlFormat';
import { useContactDonationsListQuery } from './ContactDonationsList.generated';

interface ContactDonationsListProp {
  accountListId: string;
  contactId: string;
}

const LoadMoreButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const DonationLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

export const ContactDonationsList: React.FC<ContactDonationsListProp> = ({
  accountListId,
  contactId,
}) => {
  const { data, loading, fetchMore } = useContactDonationsListQuery({
    variables: {
      accountListId: accountListId,
      contactId: contactId,
    },
  });

  const { t } = useTranslation();

  return (
    <Box>
      {loading ? (
        <>
          <DonationLoadingPlaceHolder />
          <DonationLoadingPlaceHolder />
          <DonationLoadingPlaceHolder />
        </>
      ) : (
        <>
          <Table role="table">
            <TableHead>
              <TableRow>
                <TableCell>{t('Date')}</TableCell>
                <TableCell>{t('Amount')}</TableCell>
                <TableCell>{t('Converted Amount')}</TableCell>
                <TableCell>{t('Method')}</TableCell>
              </TableRow>
            </TableHead>
            {data?.contact.donations.nodes ? (
              data?.contact.donations.nodes.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>
                    {DateTime.fromISO(donation.donationDate).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {currencyFormat(
                      donation.amount.amount,
                      donation.amount.currency,
                    )}
                  </TableCell>
                  <TableCell>
                    {currencyFormat(
                      donation.amount.convertedAmount,
                      donation.amount.convertedCurrency,
                    )}
                  </TableCell>
                  <TableCell>{donation.paymentMethod}</TableCell>
                </TableRow>
              ))
            ) : (
              <></>
            )}
          </Table>
          {!loading && data?.contact.donations.pageInfo.hasNextPage ? (
            <LoadMoreButton
              role="button"
              variant="outlined"
              onClick={() => {
                fetchMore({
                  variables: {
                    after: data.contact.donations.pageInfo.endCursor,
                  },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) {
                      return prev;
                    }
                    return {
                      ...prev,
                      ...fetchMoreResult,
                      contact: {
                        ...prev.contact,
                        ...fetchMoreResult.contact,
                        donations: {
                          ...prev.contact.donations,
                          ...fetchMoreResult.contact.donations,
                          pageInfo: fetchMoreResult.contact.donations.pageInfo,
                          nodes: [
                            ...prev.contact.donations.nodes,
                            ...fetchMoreResult.contact.donations.nodes,
                          ],
                        },
                      },
                    };
                  },
                });
              }}
            >
              {t('Load More')}
            </LoadMoreButton>
          ) : null}
        </>
      )}
    </Box>
  );
};
