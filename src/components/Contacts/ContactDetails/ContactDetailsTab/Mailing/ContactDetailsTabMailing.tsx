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
import AddIcon from '@material-ui/icons/Add';
import { ContactMailingFragment } from './ContactMailing.generated';

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

const ContactMailingShowMoreLabel = styled(Typography)(() => ({
  color: '#2196F3',
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

const AddressAddText = styled(Typography)(() => ({
  color: '#2196F3',
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

const AddressEditIconContainer = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 1),
}));

const AddressAddIcon = styled(AddIcon)(() => ({
  color: '#2196F3',
}));

interface MailingProp {
  data: ContactMailingFragment;
}

export const ContactDetailsTabMailing: React.FC<MailingProp> = ({ data }) => {
  const { t } = useTranslation();
  const { addresses, greeting, sendNewsletter } = data;
  const primaryAddress = addresses.nodes.filter(
    (address) => address.primaryMailingAddress === true,
  )[0];
  const nonPrimaryAddresses = addresses.nodes.filter(
    (address) => address.primaryMailingAddress !== true,
  );

  const [showMoreOpen, setShowMoreOpen] = useState(false);
  return (
    <Box>
      <ContactDetailsMailingMainContainer>
        <ContactDetailsMailingIcon />
        <ContactDetailsMailingTextContainer>
          {/* Address Section */}
          {primaryAddress && (
            <>
              <ContactAddressRowContainer>
                <Typography variant="subtitle1">
                  <Box fontWeight="fontWeightBold">{primaryAddress.street}</Box>
                </Typography>
                <ContactAddressPrimaryText variant="subtitle1">
                  {`- ${t('Primary')}`}
                </ContactAddressPrimaryText>
                <AddressEditIconContainer
                  onClick={() => {
                    console.log('hi');
                  }}
                >
                  <AddressEditIcon titleAccess={t('Edit Icon')} />
                </AddressEditIconContainer>
              </ContactAddressRowContainer>

              <ContactAddressRowContainer>
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
                <ContactDetailsMailingTextContainer key={address.id}>
                  <ContactAddressRowContainer>
                    <Typography variant="subtitle1">
                      <Box fontWeight="fontWeightBold">{address.street}</Box>
                    </Typography>
                    <AddressEditIconContainer
                      onClick={() => {
                        console.log('hi');
                      }}
                    >
                      <AddressEditIcon titleAccess={t('Edit Icon')} />
                    </AddressEditIconContainer>
                  </ContactAddressRowContainer>
                  <Typography variant="subtitle1">
                    {`${address.city}, ${address.state} ${address.postalCode}`}
                  </Typography>
                  <Typography variant="subtitle1">{address.country}</Typography>
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
      <Box m={2}>
        <Grid container alignItems="center">
          <AddressAddIcon />

          <AddressAddText variant="subtitle1">
            {t('Add Address')}
          </AddressAddText>
        </Grid>
      </Box>
    </Box>
  );
};
