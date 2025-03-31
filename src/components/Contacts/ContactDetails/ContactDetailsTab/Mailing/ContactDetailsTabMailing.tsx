import React, { useState } from 'react';
import CreateIcon from '@mui/icons-material/Create';
import LocationOn from '@mui/icons-material/LocationOn';
import { Box, IconButton, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import { sourceToStr } from 'src/utils/sourceHelper';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../../ContactDetailContext';
import { AddButton, AddIcon, AddText } from '../StyledComponents';
import { AddAddressModal } from './AddAddressModal/AddAddressModal';
import { ContactMailingFragment } from './ContactMailing.generated';
import { EditContactAddressModal } from './EditContactAddressModal/EditContactAddressModal';
import { EditMailingInfoModal } from './EditMailingInfoModal/EditMailingInfoModal';

const ContactDetailsMailingMainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const ContactDetailsMailingIcon = styled(LocationOn)(({ theme }) => ({
  margin: theme.spacing(1, 2),
  color: theme.palette.mpdxGrayMedium.main,
}));

const ContactDetailsMailingTextContainer = styled(Box)(({}) => ({
  flexGrow: 4,
}));

const ContactDetailsMailingLabelTextContainer = styled(Box)(({}) => ({
  display: 'flex',
  marginTop: '10px',
}));

const StyledAddressTypography = styled(Typography)(() => ({
  lineHeight: '1.25',
}));

const ContactMailingShowMoreLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const ContactAddressPrimaryText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: theme.palette.text.secondary,
}));

const ContactAddressRowContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: 10,
}));

const AddressEditIcon = styled(CreateIcon)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: theme.palette.mpdxGrayMedium.main,
}));

const AddressEditIconContainer = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 1),
}));

interface MailingProp {
  accountListId: string;
  data: ContactMailingFragment;
}

export const ContactDetailsTabMailing: React.FC<MailingProp> = ({
  data,
  accountListId,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { addresses, id } = data;
  const {
    editingAddressId,
    setEditingAddressId,
    addAddressModalOpen,
    setAddAddressModalOpen,
    editMailingModalOpen,
    setEditMailingModalOpen,
  } = React.useContext(ContactDetailContext) as ContactDetailsType;
  const primaryAddress = addresses.nodes.filter(
    (address) => address.primaryMailingAddress === true,
  )[0];
  const nonPrimaryAddresses = addresses.nodes.filter(
    (address) => address.primaryMailingAddress !== true,
  );

  const selectedAddress =
    editingAddressId &&
    addresses.nodes.filter((address) => address.id === editingAddressId)[0];

  const [showContactDetailTabMoreOpen, setShowContactDetailTabMoreOpen] =
    useState(false);
  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ position: 'absolute', right: 2, top: 2 }}>
          <AddButton onClick={() => setAddAddressModalOpen(true)}>
            <AddIcon />
            <AddText variant="subtitle1">{t('Add Address')}</AddText>
          </AddButton>
        </Box>
      </Box>
      <Box>
        <ContactDetailsMailingMainContainer>
          <ContactDetailsMailingIcon />
          <ContactDetailsMailingTextContainer>
            {/* Address Section */}
            {primaryAddress && (
              <>
                <ContactAddressRowContainer>
                  <Typography variant="subtitle1">
                    <Box fontWeight="bold">{primaryAddress.street}</Box>
                  </Typography>
                  <ContactAddressPrimaryText variant="subtitle1">
                    {`- ${t('Primary')}`}
                  </ContactAddressPrimaryText>
                  <AddressEditIconContainer
                    onClick={() => {
                      setEditingAddressId(primaryAddress.id);
                    }}
                    aria-label={t('Edit Address Icon')}
                  >
                    <AddressEditIcon />
                  </AddressEditIconContainer>
                </ContactAddressRowContainer>

                <Box
                  style={{
                    textDecoration: primaryAddress.historic
                      ? 'line-through'
                      : 'none',
                  }}
                >
                  <StyledAddressTypography variant="subtitle1">
                    {`${primaryAddress.city}${primaryAddress.city && ','} ${
                      primaryAddress.state ?? ''
                    } ${primaryAddress.postalCode}`}
                  </StyledAddressTypography>

                  <StyledAddressTypography variant="subtitle1">
                    {primaryAddress.country}
                  </StyledAddressTypography>
                </Box>
                <Typography variant="subtitle1">
                  {t('Source:')} {sourceToStr(t, primaryAddress.source)} (
                  {dateFormat(
                    DateTime.fromISO(
                      primaryAddress.startDate || primaryAddress.createdAt,
                    ),
                    locale,
                  )}
                  )
                </Typography>
              </>
            )}
            {/* Show More Section */}
            {showContactDetailTabMoreOpen &&
              nonPrimaryAddresses.map((address) => (
                <ContactDetailsMailingTextContainer
                  key={address.id}
                  style={{
                    textDecoration: address.historic ? 'line-through' : 'none',
                  }}
                  data-testid="NonPrimaryAddresses"
                >
                  <ContactAddressRowContainer>
                    <Typography variant="subtitle1">
                      <Box fontWeight="bold">{address.street ?? ''}</Box>
                    </Typography>
                    <AddressEditIconContainer
                      onClick={() => {
                        setEditingAddressId(address.id);
                      }}
                      aria-label={t('Edit Icon')}
                    >
                      <AddressEditIcon />
                    </AddressEditIconContainer>
                  </ContactAddressRowContainer>
                  <StyledAddressTypography variant="subtitle1">
                    {`${address.city ?? ''}${address.city && ','} ${
                      address.state ?? ''
                    } ${address.postalCode ?? ''}`}
                  </StyledAddressTypography>
                  <StyledAddressTypography variant="subtitle1">
                    {address.country ?? ''}
                  </StyledAddressTypography>
                  <Typography variant="subtitle1">
                    {t('Source:')} {sourceToStr(t, address.source)} (
                    {dateFormat(
                      DateTime.fromISO(address.startDate || address.createdAt),
                      locale,
                    )}
                    )
                  </Typography>
                </ContactDetailsMailingTextContainer>
              ))}
            {nonPrimaryAddresses.length > 0 && (
              <ContactDetailsMailingLabelTextContainer>
                <Link href="#" underline="hover">
                  <ContactMailingShowMoreLabel
                    variant="subtitle1"
                    onClick={() =>
                      setShowContactDetailTabMoreOpen(
                        !showContactDetailTabMoreOpen,
                      )
                    }
                  >
                    {showContactDetailTabMoreOpen
                      ? t('Show Less')
                      : t('Show {{amount}} More', {
                          amount: nonPrimaryAddresses.length,
                        })}
                  </ContactMailingShowMoreLabel>
                </Link>
              </ContactDetailsMailingLabelTextContainer>
            )}
          </ContactDetailsMailingTextContainer>
        </ContactDetailsMailingMainContainer>
      </Box>
      {selectedAddress && (
        <EditContactAddressModal
          contactId={id}
          accountListId={accountListId}
          address={selectedAddress}
          handleClose={() => setEditingAddressId(undefined)}
        />
      )}
      {addAddressModalOpen && (
        <AddAddressModal
          contactId={id}
          accountListId={accountListId}
          handleClose={() => setAddAddressModalOpen(false)}
        />
      )}
      {editMailingModalOpen && (
        <EditMailingInfoModal
          contact={data}
          accountListId={accountListId}
          handleClose={() => setEditMailingModalOpen(false)}
        />
      )}
    </>
  );
};
