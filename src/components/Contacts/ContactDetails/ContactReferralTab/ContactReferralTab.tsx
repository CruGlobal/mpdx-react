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
              {data?.contact.contactReferralsByMe.nodes.length > 0 ? (
                data?.contact.contactReferralsByMe.nodes.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.referredTo.name}</TableCell>
                    <TableCell>{'1/1/1900'}</TableCell>
                  </TableRow>
                ))
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
