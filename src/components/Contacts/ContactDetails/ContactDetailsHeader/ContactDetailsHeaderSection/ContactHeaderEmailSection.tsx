import { styled, Typography } from '@material-ui/core';
import { Email } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';

import React, { ReactElement } from 'react';
import theme from '../../../../../theme';
import { ContactDetailsHeaderFragment } from '../ContactDetailsHeader.generated';
import { ContactDetailsHeaderSection } from './ContactDetailsHeaderSection';

interface Props {
  loading: boolean;
  contact?: ContactDetailsHeaderFragment;
}

const EmailIcon = styled(Email)(({}) => ({
  margin: 8,
  width: 20,
  height: 20,
  color: theme.palette.text.secondary,
}));

export const ContactHeaderEmailSection = ({
  loading,
  contact,
}: Props): ReactElement => {
  let content: ReactElement = null;

  if (loading) {
    content = <Skeleton />;
  } else if (contact) {
    const {
      primaryPerson: { primaryEmailAddress: { email } = {} } = {},
    } = contact;

    if (!!email) {
      content = <Typography variant="subtitle1">{email}</Typography>;
    }
  }

  return (
    <ContactDetailsHeaderSection icon={<EmailIcon />}>
      {content}
    </ContactDetailsHeaderSection>
  );
};
