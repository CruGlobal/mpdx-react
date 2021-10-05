import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import { StatusEnum } from '../../../../graphql/types.generated';

interface ContactStatusLabelProps {
  status: StatusEnum;
}

enum ContactStatusEnum {
  APPOINTMENT_SCHEDULED = 'Appointment Scheduled',
  ASK_IN_FUTURE = 'Ask in Future',
  CALL_FOR_DECISION = 'Call For Decision',
  CONTACT_FOR_APPOINTMENT = 'Contact For Appointment',
  CULTIVATE_RELATIONSHIP = 'Cultivate Relationship',
  EXPIRED_REFERRAL = 'Expired Referral',
  NEVER_ASK = 'Never Ask',
  NEVER_CONTACTED = 'Never Contacted',
  NOT_INTERESTED = 'Not Interested',
  PARTNER_FINANCIAL = 'Partner - Financial',
  PARTNER_PRAY = 'Partner - Pray',
  PARTNER_SPECIAL = 'Partner - Special',
  RESEARCH_ABANDONED = 'Research Abandoned',
  UNRESPONSIVE = 'Unresponsive',
}

export const ContactStatusLabel: React.FC<ContactStatusLabelProps> = ({
  status,
}) => {
  const { t } = useTranslation();

  return <Typography>{t(ContactStatusEnum[status])}</Typography>;
};
