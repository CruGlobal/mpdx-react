import React from 'react';
import { Typography } from '@mui/material';
import { StatusEnum as ContactPartnershipStatusEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';

interface ContactPartnershipStatusLabelProps {
  status: ContactPartnershipStatusEnum;
}

export const ContactPartnershipStatusLabel: React.FC<
  ContactPartnershipStatusLabelProps
> = ({ status }) => {
  const { contactPartnershipStatus } = useContactPartnershipStatuses();
  return (
    <Typography>{contactPartnershipStatus[status]?.translated}</Typography>
  );
};
