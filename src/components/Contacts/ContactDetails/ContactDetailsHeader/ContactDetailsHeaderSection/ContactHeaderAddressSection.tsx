import { Box, Link, styled, Typography } from '@material-ui/core';
import { LocationOn } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';

import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../../../theme';
import { ContactDetailsHeaderFragment } from '../ContactDetailsHeader.generated';
import { ContactDetailsHeaderSection } from './ContactDetailsHeaderSection';

interface Props {
  loading: boolean;
  contact?: ContactDetailsHeaderFragment;
}

const LocationIcon = styled(LocationOn)(({}) => ({
  margin: 8,
  width: 20,
  height: 20,
  color: theme.palette.text.secondary,
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
        <Skeleton />
        <Skeleton />
        <Skeleton />
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
    <ContactDetailsHeaderSection icon={<LocationIcon />}>
      {content}
    </ContactDetailsHeaderSection>
  );
};
