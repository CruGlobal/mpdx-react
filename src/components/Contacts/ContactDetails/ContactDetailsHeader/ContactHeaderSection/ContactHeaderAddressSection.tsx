import { Box, Link, styled, Typography } from '@material-ui/core';
import { LocationOn } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';

import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../../../theme';
import { ContactHeaderAddressFragment } from './ContactHeaderAddress.generated';
import { ContactHeaderSection } from './ContactHeaderSection';

interface Props {
  loading: boolean;
  contact?: ContactHeaderAddressFragment;
}

const LocationIcon = styled(LocationOn)(({}) => ({
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

export const ContactHeaderAddressSection = ({
  loading,
  contact,
}: Props): ReactElement => {
  const { t } = useTranslation();

  const greeting = contact?.greeting;
  const primaryAddress = contact?.primaryAddress;

  if (loading) {
    return (
      <ContactHeaderSection icon={<LocationIcon />}>
        <TextSkeleton variant="text" />
        <TextSkeleton variant="text" />
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else if (greeting && primaryAddress) {
    const { street, city, state, postalCode } = primaryAddress;

    if (street && city && state && postalCode) {
      return (
        <ContactHeaderSection icon={<LocationIcon />}>
          <Typography variant="subtitle1">{greeting}</Typography>
          <Typography variant="subtitle1">{street}</Typography>
          <Box>
            <Typography
              style={{ display: 'inline-block' }}
              variant="subtitle1"
            >{`${city}, ${state} ${postalCode}`}</Typography>
            <Link style={{ display: 'inline-block' }} variant="subtitle1">
              {t('Google Maps')}
            </Link>
          </Box>
        </ContactHeaderSection>
      );
    }
  }

  return (
    <ContactHeaderSection icon={<LocationIcon />}>
      <Typography variant="subtitle1">{'N/A'}</Typography>
    </ContactHeaderSection>
  );
};
