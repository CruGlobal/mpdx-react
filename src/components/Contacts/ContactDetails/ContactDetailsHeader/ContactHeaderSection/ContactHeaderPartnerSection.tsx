import React from 'react';
import { Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
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
  } else if (contact && contact.contactDonorAccounts.nodes.length) {
    return (
      <ContactHeaderSection>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {contact?.contactDonorAccounts.nodes.length === 1
            ? t('Partner Number')
            : t('Partner Numbers')}
        </Typography>
        {contact?.contactDonorAccounts.nodes.map((donorAccount) => (
          <Typography key={donorAccount.id} variant="subtitle1">
            {donorAccount.donorAccount.accountNumber}
          </Typography>
        ))}
      </ContactHeaderSection>
    );
  } else {
    return null;
  }
};
