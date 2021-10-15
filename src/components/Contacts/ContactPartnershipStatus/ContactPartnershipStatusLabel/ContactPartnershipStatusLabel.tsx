import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../../graphql/types.generated';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

interface ContactPartnershipStatusLabelProps {
  status: ContactPartnershipStatusEnum;
}

export const ContactPartnershipStatusLabel: React.FC<ContactPartnershipStatusLabelProps> = ({
  status,
}) => {
  const { t } = useTranslation();

  return <Typography>{t(contactPartnershipStatus[status])}</Typography>;
};
