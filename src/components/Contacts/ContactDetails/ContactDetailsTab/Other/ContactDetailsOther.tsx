import React from 'react';
import { Box, Link, styled, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ContactDetailsTabQuery } from '../ContactDetailsTab.generated';

const ContactOtherContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1, 1, 1, 5)
}));

const ContactOtherTextContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: theme.spacing(2),
}));

const ContactOtherTextLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.hint,
  marginRight: '5px',
}));

interface ContactDetailsOtherProp {
  //TODO: convert to ContactDetailTabQuery
  contact: ContactDetailsTabQuery;
}

export const ContactDetailsOther: React.FC<ContactDetailsOtherProp> = ({
  contact,
}) => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t('Other')}</Typography>
      <ContactOtherContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Assignee')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">{contact.contact.name}</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Preferred Contact Method')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">
            {contact.contact.preferredContactMethod}
          </Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Language')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">{contact.contact.locale}</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <Typography variant="subtitle1">
            {contact.contact.timezone}
          </Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Church')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">
            {contact.contact.churchName}
          </Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <Link
            href={
              contact.contact.website.startsWith('http')
                ? contact.contact.website
                : 'http://' + contact.contact.website
            }
            target="_blank"
            rel="noopener"
          >
            <Typography variant="subtitle1">
              {contact.contact.website}
            </Typography>
          </Link>
        </ContactOtherTextContainer>
      </ContactOtherContainer>
    </Box>
  );
};
