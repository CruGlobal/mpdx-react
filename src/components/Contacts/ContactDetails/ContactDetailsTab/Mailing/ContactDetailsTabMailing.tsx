import { Box, Link, styled, Typography } from '@material-ui/core';
import { LocationOn } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContactMailingFragment } from './ContactMailing.generated';

const ContactDetailsMailingMainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(2),
}));

const ContactDetailsMailingIcon = styled(LocationOn)(({ theme }) => ({
  margin: theme.spacing(1),
  width: '14px',
  height: '20px',
  flexGrow: 1,
}));

const ContactDetailsMailingTexContainer = styled(Box)(({}) => ({
  flexGrow: 8,
}));

const ContactDetailsMailingLabelTextContainer = styled(Box)(({}) => ({
  display: 'flex',
  marginTop: '10px',
}));

const ContactDetailsMailingLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.hint,
  marginRight: '5px',
}));

interface MailingProp {
  data: ContactMailingFragment;
}

export const ContactDetailsTabMailing: React.FC<MailingProp> = ({ data }) => {
  const { t } = useTranslation();
  const { name, primaryAddress, greeting, sendNewsletter } = data;
  return (
    <Box>
      <ContactDetailsMailingMainContainer>
        <ContactDetailsMailingIcon />
        <ContactDetailsMailingTexContainer>
          {/* Address Section */}
          <Typography variant="subtitle1">{name}</Typography>
          {primaryAddress && (
            <>
              <Typography variant="subtitle1">
                {primaryAddress.street}
              </Typography>
              <Typography variant="subtitle1">
                {`${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postalCode}`}
              </Typography>
            </>
          )}
          {/* Show More Section */}
          <ContactDetailsMailingLabelTextContainer>
            <Link href="#">
              <Typography variant="subtitle1">{t('Show More')}</Typography>
            </Link>
          </ContactDetailsMailingLabelTextContainer>
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
        </ContactDetailsMailingTexContainer>
      </ContactDetailsMailingMainContainer>
    </Box>
  );
};
