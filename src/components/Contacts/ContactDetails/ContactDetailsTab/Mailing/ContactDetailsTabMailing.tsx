import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  IconButton,
  Link,
  styled,
  Typography,
} from '@material-ui/core';
import LocationOn from '@material-ui/icons/LocationOn';
import CreateIcon from '@material-ui/icons/Create';
import {
  ContactDetailsAddButton,
  ContactDetailsAddIcon,
  ContactDetailsAddText,
} from '../People/ContactDetailsTabPeople';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../../ContactDetailContext';
import { ContactMailingFragment } from './ContactMailing.generated';
import { EditContactAddressModal } from './EditContactAddressModal/EditContactAddressModal';
import { AddAddressModal } from './AddAddressModal/AddAddressModal';

const ContactDetailsMailingMainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(1),
}));

const ContactDetailsMailingIcon = styled(LocationOn)(({ theme }) => ({
  margin: theme.spacing(1, 2),
  color: theme.palette.cruGrayMedium.main,
}));

const ContactDetailsMailingTextContainer = styled(Box)(({}) => ({
  flexGrow: 4,
}));

const ContactDetailsMailingLabelTextContainer = styled(Box)(({}) => ({
  display: 'flex',
  marginTop: '10px',
}));

const ContactDetailsMailingLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.hint,
  marginRight: '5px',
}));

const ContactMailingShowMoreLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const ContactAddressPrimaryText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: theme.palette.text.hint,
}));

const ContactAddressRowContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const AddressEditIcon = styled(CreateIcon)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: theme.palette.cruGrayMedium.main,
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
  const { addresses, greeting, sendNewsletter, id } = data;
  const {
    editingAddressId,
    setEditingAddressId,
    addAddressModalOpen,
    setAddAddressModalOpen,
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

  const [showMoreOpen, setShowMoreOpen] = useState(false);
  return (
    <>
      <Box>
        <ContactDetailsMailingMainContainer>
          <ContactDetailsMailingIcon />
          <ContactDetailsMailingTextContainer>
            {/* Address Section */}
            {primaryAddress && (
              <>
                <ContactAddressRowContainer>
                  <Typography variant="subtitle1">
                    <Box fontWeight="fontWeightBold">
                      {primaryAddress.street}
                    </Box>
                  </Typography>
                  <ContactAddressPrimaryText variant="subtitle1">
                    {`- ${t('Primary')}`}
                  </ContactAddressPrimaryText>
                  <AddressEditIconContainer
                    onClick={() => {
                      setEditingAddressId(primaryAddress.id);
                    }}
                    aria-label={t('Edit Icon')}
                  >
                    <AddressEditIcon />
                  </AddressEditIconContainer>
                </ContactAddressRowContainer>

                <ContactAddressRowContainer
                  style={{
                    textDecoration: primaryAddress.historic
                      ? 'line-through'
                      : 'none',
                  }}
                >
                  <Typography variant="subtitle1">
                    {`${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postalCode}`}
                  </Typography>
                </ContactAddressRowContainer>
                <ContactAddressRowContainer>
                  <Typography variant="subtitle1">
                    {primaryAddress.country}
                  </Typography>
                </ContactAddressRowContainer>
                <ContactAddressRowContainer>
                  <Typography variant="subtitle1">
                    {t(`Source: ${primaryAddress.source}`)}
                  </Typography>
                </ContactAddressRowContainer>
              </>
            )}
            {/* Show More Section */}
            {nonPrimaryAddresses.length > 0 ? (
              <ContactDetailsMailingLabelTextContainer>
                <Link href="#">
                  <ContactMailingShowMoreLabel
                    variant="subtitle1"
                    onClick={() => setShowMoreOpen(!showMoreOpen)}
                  >
                    {showMoreOpen ? t('Show Less') : t('Show More')}
                  </ContactMailingShowMoreLabel>
                </Link>
              </ContactDetailsMailingLabelTextContainer>
            ) : null}
            {showMoreOpen
              ? nonPrimaryAddresses.map((address) => (
                  <ContactDetailsMailingTextContainer
                    key={address.id}
                    style={{
                      textDecoration: address.historic
                        ? 'line-through'
                        : 'none',
                    }}
                  >
                    <ContactAddressRowContainer>
                      <Typography variant="subtitle1">
                        <Box fontWeight="fontWeightBold">{address.street}</Box>
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
                    <Typography variant="subtitle1">
                      {`${address.city}, ${address.state} ${address.postalCode}`}
                    </Typography>
                    <Typography variant="subtitle1">
                      {address.country}
                    </Typography>
                    <Typography variant="subtitle1">
                      {t(`Source: ${address.source}`)}
                    </Typography>
                  </ContactDetailsMailingTextContainer>
                ))
              : null}
            {/* Greeting Section */}
            <ContactDetailsMailingLabelTextContainer>
              <ContactDetailsMailingLabel variant="subtitle1">
                {t('Greeting')}
              </ContactDetailsMailingLabel>
              <Typography variant="subtitle1">{greeting}</Typography>
            </ContactDetailsMailingLabelTextContainer>
            {/* Newsletter Section */}
            <ContactDetailsMailingLabelTextContainer>
              <ContactDetailsMailingLabel variant="subtitle1">
                {t('Newsletter')}
              </ContactDetailsMailingLabel>
              <Typography variant="subtitle1">{sendNewsletter}</Typography>
            </ContactDetailsMailingLabelTextContainer>
            {/* Magazine Section */}
            <ContactDetailsMailingLabelTextContainer>
              <ContactDetailsMailingLabel variant="subtitle1">
                {t('Magazine')}
              </ContactDetailsMailingLabel>
              <Typography variant="subtitle1">Not Implemented</Typography>
            </ContactDetailsMailingLabelTextContainer>
          </ContactDetailsMailingTextContainer>
        </ContactDetailsMailingMainContainer>
        <Grid container alignItems="center">
          <ContactDetailsAddButton onClick={() => setAddAddressModalOpen(true)}>
            <ContactDetailsAddIcon />
            <ContactDetailsAddText variant="subtitle1">
              {t('Add Address')}
            </ContactDetailsAddText>
          </ContactDetailsAddButton>
        </Grid>
      </Box>
      {selectedAddress ? (
        <EditContactAddressModal
          contactId={id}
          accountListId={accountListId}
          address={selectedAddress}
          handleClose={() => setEditingAddressId(undefined)}
        />
      ) : null}
      {addAddressModalOpen ? (
        <AddAddressModal
          contactId={id}
          accountListId={accountListId}
          handleClose={() => setAddAddressModalOpen(false)}
        />
      ) : null}
    </>
  );
};
