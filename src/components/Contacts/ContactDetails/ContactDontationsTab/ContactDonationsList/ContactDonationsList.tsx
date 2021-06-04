import {
  Box,
  Button,
  styled,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currencyFormat } from '../../../../../lib/intlFormat/intlFormat';
import { useContactDonationsListQuery } from './ContactDonationsList.generated';

interface ContactDonationsListProp {
  accountListId: string;
  contactId: string;
}
const DonationLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

export const ContactDonationsList: React.FC<ContactDonationsListProp> = ({
  accountListId,
  contactId,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [range, setRange] = useState(10);

  const {
    data,
    loading,
    fetchMore,
    networkStatus,
  } = useContactDonationsListQuery({
    variables: {
      accountListId: accountListId,
      contactId: contactId,
      first: range,
    },
    notifyOnNetworkStatusChange: true,
  });

  const { t } = useTranslation();

  return (
    <Box>
      <Table>
        <TableHead>
          <TableCell>{t('Date')}</TableCell>
          <TableCell>{t('Amount')}</TableCell>
          <TableCell>{t('Converted Amount')}</TableCell>
        </TableHead>
        {loading ? (
          <TableRow>
            <TableCell>
              <DonationLoadingPlaceHolder />
            </TableCell>
            <TableCell>
              <DonationLoadingPlaceHolder />
            </TableCell>
            <TableCell>
              <DonationLoadingPlaceHolder />
            </TableCell>
          </TableRow>
        ) : (
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
            </TableRow>
          ))
        )}
      </Table>
      {!loading && data?.contact.donations.pageInfo.hasNextPage ? (
        <Button variant="outlined">{t('Load More')}</Button>
      ) : null}
    </Box>
  );
};
