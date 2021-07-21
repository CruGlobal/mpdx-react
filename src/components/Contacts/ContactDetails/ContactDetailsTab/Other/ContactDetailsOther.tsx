import React from 'react';
import { Box, styled, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { PreferredContactMethodEnum } from '../../../../../../graphql/types.generated';
import { ContactOtherFragment } from './ContactOther.generated';

const ContactOtherContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1, 1, 1, 5),
}));

const ContactOtherTextContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginLeft: theme.spacing(2),
}));

const ContactOtherTextLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.hint,
  marginRight: '5px',
}));

interface ContactDetailsOtherProp {
  contact: ContactOtherFragment;
}

export const localizedContactMethod = (method?: string | null): string => {
  switch (method) {
    case PreferredContactMethodEnum.Sms:
      return i18n.t('SMS');
    case PreferredContactMethodEnum.PhoneCall:
      return i18n.t('Phone Call');
    case PreferredContactMethodEnum.Email:
      return i18n.t('Email');
    case PreferredContactMethodEnum.Facebook:
      return i18n.t('Facebook');
    case PreferredContactMethodEnum.Instagram:
      return i18n.t('Instagram');
    case PreferredContactMethodEnum.WeChat:
      return i18n.t('WeChat');
    case PreferredContactMethodEnum.WhatsApp:
      return i18n.t('WhatsApp');
    default:
      return i18n.t('N/A');
  }
};

export const ContactDetailsOther: React.FC<ContactDetailsOtherProp> = ({
  contact,
}) => {
  const { t } = useTranslation();
  const {
    name,
    preferredContactMethod,
    locale,
    timezone,
    churchName,
    website,
  } = contact;

  return (
    <Box>
      <ContactOtherContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Assignee')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">{name}</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Preferred Contact Method')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">
            {localizedContactMethod(preferredContactMethod)}
          </Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Language')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">{locale}</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <Typography variant="subtitle1">{timezone}</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Church')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">{churchName}</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <Typography variant="subtitle1">{website}</Typography>
        </ContactOtherTextContainer>
      </ContactOtherContainer>
    </Box>
  );
};
