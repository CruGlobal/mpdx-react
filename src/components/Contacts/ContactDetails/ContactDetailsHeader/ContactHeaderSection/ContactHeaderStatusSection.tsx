import { styled, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import React from 'react';
import { ContactHeaderSection } from './ContactHeaderSection';
import { ContactHeaderStatusFragment } from './ContactHeaderStatus.generated';
import { HandshakeIcon } from './HandshakeIcon';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

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

export const ContactHeaderStatusSection: React.FC<Props> = ({
  loading,
  contact,
}) => {
  const status = contact?.status;

  if (loading) {
    return (
      <ContactHeaderSection icon={<HandshakeIcon />}>
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else if (status) {
    const statusText = contactPartnershipStatus[status];

    return (
      <ContactHeaderSection icon={<HandshakeIcon />}>
        <Typography variant="subtitle1">{statusText}</Typography>
      </ContactHeaderSection>
    );
  } else {
    return null;
  }
};
