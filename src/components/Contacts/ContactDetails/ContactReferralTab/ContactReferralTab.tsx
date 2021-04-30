import {
  Box,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { DateTime } from 'luxon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useContactReferralTabQuery } from './ContactReferralTab.generated';

const ContactReferralContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const ContactReferralLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

interface ContactReferralTabProps {
  accountListId: string;
  contactId: string;
}

export const ContactReferralTab: React.FC<ContactReferralTabProps> = ({
  accountListId,
  contactId,
}) => {
  const { data, loading } = useContactReferralTabQuery({
    variables: {
      accountListId: accountListId,
      contactId: contactId,
    },
  });

  const { t } = useTranslation();

  return (
    <ContactReferralContainer>
      {loading ? (
        <>
          <ContactReferralLoadingPlaceHolder />
          <ContactReferralLoadingPlaceHolder />
          <ContactReferralLoadingPlaceHolder />
        </>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('Name')}</TableCell>
                <TableCell>{t('Referral Date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.contact &&
              data.contact.contactReferralsByMe.nodes.length > 0 ? (
                data?.contact.contactReferralsByMe.nodes.map(
                  ({ id, referredTo, createdAt }) => (
                    <TableRow key={id}>
                      <TableCell>{referredTo.name}</TableCell>
                      <TableCell>
                        {DateTime.fromISO(createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ),
                )
              ) : (
                <TableRow key="no_data">
                  <TableCell>{t('No Referrals')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </ContactReferralContainer>
  );
};
