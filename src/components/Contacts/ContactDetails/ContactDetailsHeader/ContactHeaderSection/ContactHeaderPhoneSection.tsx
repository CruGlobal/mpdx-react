import React, { ReactElement } from 'react';
import Phone from '@mui/icons-material/Phone';
import { Box, Link, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
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
  const number = contact?.primaryPerson?.primaryPhoneNumber?.number;
  const location = contact?.primaryPerson?.primaryPhoneNumber?.location;

  if (loading) {
    return (
      <ContactHeaderSection icon={<PhoneIcon />}>
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else if (number) {
    return (
      <ContactHeaderSection icon={<PhoneIcon />}>
        <Box style={{ display: 'flex' }}>
          <Typography style={{ width: 'fit-content' }} variant="subtitle1">
            <Link href={`tel:${number}`}>{number}</Link>
          </Typography>
          <Typography
            style={{
              width: 'fit-content',
              marginLeft: 5,
              color: theme.palette.text.primary,
            }}
            variant="subtitle1"
          >
            {location}
          </Typography>
        </Box>
      </ContactHeaderSection>
    );
  }

  return (
    <ContactHeaderSection icon={<PhoneIcon />}>
      <Typography variant="subtitle1">{'N/A'}</Typography>
    </ContactHeaderSection>
  );
};
