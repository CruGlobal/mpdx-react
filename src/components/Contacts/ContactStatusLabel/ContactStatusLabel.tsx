import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import { StatusEnum as ContactPartnershipStatus } from '../../../../graphql/types.generated';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

interface ContactStatusLabelProps {
  status: ContactPartnershipStatus;
}

export const ContactStatusLabel: React.FC<ContactStatusLabelProps> = ({
  status,
}) => {
  const { t } = useTranslation();

  return <Typography>{t(contactPartnershipStatus[status])}</Typography>;
};
