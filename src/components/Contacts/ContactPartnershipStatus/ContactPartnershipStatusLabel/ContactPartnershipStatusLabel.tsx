import React from 'react';
import { Typography } from '@mui/material';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../../graphql/types.generated';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

interface ContactPartnershipStatusLabelProps {
  status: ContactPartnershipStatusEnum;
}

export const ContactPartnershipStatusLabel: React.FC<
  ContactPartnershipStatusLabelProps
> = ({ status }) => {
  return <Typography>{contactPartnershipStatus[status]}</Typography>;
};
