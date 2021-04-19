import { styled, Typography } from '@material-ui/core';
import { Phone } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';

import React, { ReactElement } from 'react';
import theme from '../../../../../theme';
import { ContactHeaderPhoneFragment } from './ContactHeaderPhone.generated';
import { ContactHeaderSection } from './ContactHeaderSection';

interface Props {
  loading: boolean;
  contact?: ContactHeaderPhoneFragment;
}

const PhoneIcon = styled(Phone)(({}) => ({
  margin: 8,
  width: 20,
  height: 20,
  color: theme.palette.text.secondary,
}));
const TextSkeleton = styled(Skeleton)(({}) => ({
  display: 'inline',
  marginLeft: 18,
  width: 200,
  fontSize: 16,
}));

export const ContactHeaderPhoneSection = ({
  loading,
  contact,
}: Props): ReactElement => {
  if (loading) {
    return (
      <ContactHeaderSection icon={<PhoneIcon />}>
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else if (contact) {
    const {
      primaryPerson: { primaryPhoneNumber: { number } = {} } = {},
    } = contact;

    if (!!number) {
      return (
        <ContactHeaderSection icon={<PhoneIcon />}>
          <Typography variant="subtitle1">{number}</Typography>
        </ContactHeaderSection>
      );
    }
  }

  return <ContactHeaderSection icon={<PhoneIcon />} />;
};
