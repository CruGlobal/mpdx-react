import { Box, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOn from '@mui/icons-material/LocationOn';
import Skeleton from '@mui/material/Skeleton';

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

  const envelope = contact?.envelopeGreeting;
  const primaryAddress = contact?.primaryAddress;

  if (loading) {
    return (
      <ContactHeaderSection icon={<LocationIcon />}>
        <TextSkeleton variant="text" />
        <TextSkeleton variant="text" />
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else if (envelope && primaryAddress) {
    const { street, city, state, postalCode } = primaryAddress;

    if (street && city && state && postalCode) {
      const mapURL = `https://www.google.com/maps/search/?api=1&query=${street}%2C+${city}%2C+${state}+${postalCode}`;

      return (
        <ContactHeaderSection icon={<LocationIcon />}>
          <Typography variant="subtitle1">{envelope}</Typography>
          <Typography variant="subtitle1">{street}</Typography>
          <Box>
            <Typography
              style={{ display: 'inline-block' }}
              variant="subtitle1"
            >{`${city}, ${state} ${postalCode}`}</Typography>{' '}
            <Link
              href={mapURL.replaceAll(' ', '+')}
              target="_blank"
              rel="noopener"
              style={{ display: 'inline-block' }}
              variant="subtitle1"
            >
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
