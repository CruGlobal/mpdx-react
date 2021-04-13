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

  let content: ReactElement = null;

  if (loading) {
    content = (
      <>
        <TextSkeleton variant="text" />
        <TextSkeleton variant="text" />
        <TextSkeleton variant="text" />
      </>
    );
  } else if (contact) {
    const {
      greeting,
      primaryAddress: { street, city, state, postalCode } = {},
    } = contact;

    if (!!greeting && !!street && !!city && !!state && !!postalCode) {
      content = (
        <>
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
        </>
      );
    }
  }

  return (
    <ContactHeaderSection icon={<LocationIcon />}>
      {content}
    </ContactHeaderSection>
  );
};
