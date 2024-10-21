import React from 'react';
import { Typography } from '@mui/material';
import { StatusEnum as ContactPartnershipStatusEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';

interface ContactPartnershipStatusLabelProps {
  status: ContactPartnershipStatusEnum;
}

export const ContactPartnershipStatusLabel: React.FC<
  ContactPartnershipStatusLabelProps
> = ({ status }) => {
  const { getLocalizedContactStatus } = useLocalizedConstants();
  return <Typography>{getLocalizedContactStatus(status)}</Typography>;
};
