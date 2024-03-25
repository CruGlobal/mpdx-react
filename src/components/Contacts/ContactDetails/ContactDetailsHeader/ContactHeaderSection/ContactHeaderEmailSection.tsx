import React, { ReactElement } from 'react';
import Email from '@mui/icons-material/Email';
import { Link, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from '../../../../../theme';
import { ContactHeaderEmailFragment } from './ContactHeaderEmail.generated';
import { ContactHeaderSection } from './ContactHeaderSection';

interface Props {
  loading: boolean;
  contact?: ContactHeaderEmailFragment;
}

const EmailIcon = styled(Email)(({}) => ({
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

export const ContactHeaderEmailSection = ({
  loading,
  contact,
}: Props): ReactElement => {
  const email = contact?.primaryPerson?.primaryEmailAddress?.email;

  if (loading) {
    return (
      <ContactHeaderSection icon={<EmailIcon />}>
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else if (email) {
    return (
      <ContactHeaderSection icon={<EmailIcon />}>
        <Typography variant="subtitle1" style={{ width: 'fit-content' }}>
          <Link href={`mailto:${email}`}>{email}</Link>
        </Typography>
      </ContactHeaderSection>
    );
  }

  return (
    <ContactHeaderSection icon={<EmailIcon />}>
      <Typography variant="subtitle1">{'N/A'}</Typography>
    </ContactHeaderSection>
  );
};
