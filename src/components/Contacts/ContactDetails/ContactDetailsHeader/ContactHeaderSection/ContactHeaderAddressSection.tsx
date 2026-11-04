import React, { ReactElement, useState } from 'react';
import HistoryIcon from '@mui/icons-material/History';
import LocationOn from '@mui/icons-material/LocationOn';
import { Box, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { AddressHistoryModal } from 'src/components/Shared/AddressHistoryModal/AddressHistoryModal';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import theme from '../../../../../theme';
import { ContactHeaderAddressFragment } from './ContactHeaderAddress.generated';
import { ContactHeaderSection } from './ContactHeaderSection';
import { TextSkeleton } from './styledComponents/TextSkeleton';

interface Props {
  accountListId: string;
  loading: boolean;
  contact?: ContactHeaderAddressFragment;
}

const LocationIcon = styled(LocationOn)(({}) => ({
  margin: 8,
  width: 20,
  height: 20,
  color: theme.palette.text.secondary,
}));

const StyledAddressTypography = styled(Typography)(() => ({
  lineHeight: '1.50',
}));

export const ContactHeaderAddressSection = ({
  accountListId,
  loading,
  contact,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

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
    const changeDate = contact.latestAddressChange?.date;

    if (street && city && postalCode) {
      const additionalOptions = state ? `${state}+${postalCode}` : postalCode;
      const mapURL = `https://www.google.com/maps/search/?api=1&query=${street}%2C+${city}%2C+${additionalOptions}`;

      return (
        <ContactHeaderSection icon={<LocationIcon />}>
          <StyledAddressTypography variant="subtitle1">
            {envelope}
          </StyledAddressTypography>
          <StyledAddressTypography variant="subtitle1">
            {street}
          </StyledAddressTypography>
          <Box>
            <StyledAddressTypography
              style={{ display: 'inline-block' }}
              variant="subtitle1"
            >{`${city}, ${
              state ?? ''
            } ${postalCode}`}</StyledAddressTypography>{' '}
            <Link
              href={mapURL.replaceAll(' ', '+')}
              target="_blank"
              rel="noopener"
              underline="hover"
              style={{ display: 'inline-block' }}
              variant="subtitle1"
            >
              {t('Google Maps')}
            </Link>
          </Box>
          <Link
            component="button"
            onClick={() => setHistoryModalOpen(true)}
            underline="hover"
            variant="body2"
            display="flex"
            alignItems="center"
            gap={0.5}
            mt={1}
          >
            <HistoryIcon fontSize="small" />
            {changeDate
              ? t('Changed {{date}} · See history', {
                  date: dateFormat(DateTime.fromISO(changeDate), locale),
                })
              : t('See history')}
          </Link>
          {historyModalOpen && (
            <AddressHistoryModal
              accountListId={accountListId}
              contactId={contact.id}
              handleClose={() => setHistoryModalOpen(false)}
            />
          )}
        </ContactHeaderSection>
      );
    }
  }

  return (
    <ContactHeaderSection icon={<LocationIcon />} empty>
      <Typography variant="subtitle1">{'N/A'}</Typography>
    </ContactHeaderSection>
  );
};
