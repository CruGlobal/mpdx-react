import React from 'react';
import {
  Box,
  Button,
  Table,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import {
  currencyFormat,
  dateFormat,
} from '../../../../../lib/intlFormat/intlFormat';
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
  const locale = useLocale();

  return (
    <Box>
      {loading && !data ? (
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
            {data?.contact.donations.nodes
              ? data?.contact.donations.nodes.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      {dateFormat(
                        DateTime.fromISO(donation.donationDate),
                        locale,
                      )}
                    </TableCell>
                    <TableCell>
                      {currencyFormat(
                        donation.amount.amount,
                        donation.amount.currency,
                        locale,
                      )}
                    </TableCell>
                    <TableCell>
                      {currencyFormat(
                        donation.amount.convertedAmount,
                        donation.amount.convertedCurrency,
                        locale,
                      )}
                    </TableCell>
                    <TableCell>{donation.paymentMethod}</TableCell>
                  </TableRow>
                ))
              : null}
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
