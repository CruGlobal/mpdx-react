import { styled, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactHeaderSection } from './ContactHeaderSection';
import { ContactHeaderStatusFragment } from './ContactHeaderStatus.generated';
import { HandshakeIcon } from './HandshakeIcon';

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

export const ContactHeaderStatusSection = ({
  loading,
  contact,
}: Props): ReactElement => {
  const { t } = useTranslation();

  const status = contact?.status;

  if (loading) {
    return (
      <ContactHeaderSection icon={<HandshakeIcon />}>
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else if (status) {
    let statusText = '';

    switch (status) {
      case 'NEVER_CONTACTED':
        statusText = t('Never Contacted');
        break;

      case 'ASK_IN_FUTURE':
        statusText = t('Ask in Future');
        break;

      case 'CULTIVATE_RELATIONSHIP':
        statusText = t('Cultivate Relationship');
        break;

      case 'CONTACT_FOR_APPOINTMENT':
        statusText = t('Contact for Appointment');
        break;

      case 'APPOINTMENT_SCHEDULED':
        statusText = t('Appointment Scheduled');
        break;

      case 'CALL_FOR_DECISION':
        statusText = t('Call for Decision');
        break;

      case 'PARTNER_FINANCIAL':
        statusText = t('Partner - Financial');
        break;

      case 'PARTNER_SPECIAL':
        statusText = t('Partner - Special');
        break;

      case 'PARTNER_PRAY':
        statusText = t('Partner - Prayer');
        break;

      case 'NOT_INTERESTED':
        statusText = t('Not Interested');
        break;

      case 'UNRESPONSIVE':
        statusText = t('Unresponsive');
        break;

      case 'NEVER_ASK':
        statusText = t('Never Ask');
        break;

      case 'RESEARCH_ABANDONED':
        statusText = t('Research Abandoned');
        break;

      case 'EXPIRED_REFERRAL':
        statusText = t('Expired Referral');
        break;
    }

    return (
      <ContactHeaderSection icon={<HandshakeIcon />}>
        <Typography variant="subtitle1">{statusText}</Typography>
      </ContactHeaderSection>
    );
  }

  return <ContactHeaderSection icon={<HandshakeIcon />} />;
};
