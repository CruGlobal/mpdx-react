import { Box, styled, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContactHeaderSection } from './ContactHeaderSection';
import { ContactHeaderStatusFragment } from './ContactHeaderStatus.generated';

interface Props {
  loading: boolean;
  contact?: ContactHeaderStatusFragment;
}

const TextSkeleton = styled(Skeleton)(({}) => ({
  display: 'inline',
  marginLeft: 18,
  width: 200,
  fontSize: 16,
}));

export const ContactHeaderPartnerSection: React.FC<Props> = ({
  loading,
  contact,
}) => {
  const { t } = useTranslation();
  if (loading) {
    return (
      <ContactHeaderSection>
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else {
    if (contact != null && contact.contactDonorAccounts.nodes.length > 0) {
      return (
        <ContactHeaderSection>
          <Typography variant="h5">{t('Partner Account')}</Typography>
          {contact?.contactDonorAccounts.nodes.map((donorAccount) => {
            return (
              <Typography variant="caption">
                {donorAccount.donorAccount.displayName +
                  ' (' +
                  donorAccount.donorAccount.accountNumber +
                  ')   '}
              </Typography>
            );
          })}
        </ContactHeaderSection>
      );
    } else {
      return <></>;
    }
  }
};
