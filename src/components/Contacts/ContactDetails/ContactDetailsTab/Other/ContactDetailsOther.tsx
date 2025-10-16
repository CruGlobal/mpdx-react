import NextLink from 'next/link';
import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { PreferredContactMethodEnum } from 'src/graphql/types.generated';
import { formatLanguage } from 'src/lib/data/languages';
import i18n from 'src/lib/i18n';
import { ContactOtherFragment } from './ContactOther.generated';

const ContactOtherContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1, 1, 1, 5),
}));

const ContactOtherTextContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginLeft: theme.spacing(2),
  alignItems: 'center',
}));

const ContactOtherTextLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginRight: '5px',
}));

const ReferralName = styled(Typography)(() => ({
  width: 'fit-content',
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
  const constants = useApiConstants();
  const { buildContactUrl } = useContactPanel();
  const languages = constants?.languages;
  const {
    user,
    preferredContactMethod,
    locale,
    timezone,
    churchName,
    website,
    contactReferralsToMe,
    greeting,
    envelopeGreeting,
  } = contact;

  const referredBy = contactReferralsToMe?.nodes[0]?.referredBy;

  return (
    <Box>
      <ContactOtherContainer>
        {/* Greeting Section */}
        <ContactOtherTextContainer alignItems="center">
          <ContactOtherTextLabel variant="subtitle1">
            {t('Greeting')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">{greeting}</Typography>
        </ContactOtherTextContainer>
        {/* Envelope Name Section */}
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Envelope Name')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">{envelopeGreeting}</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer height={28}>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Assignee')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">
            {user ? `${user.firstName} ${user.lastName}` : t('None')}
          </Typography>
        </ContactOtherTextContainer>

        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Connecting Partner')}
          </ContactOtherTextLabel>
          {referredBy && (
            <ReferralName variant="subtitle1">
              <Link
                component={NextLink}
                href={buildContactUrl(referredBy.id)}
                shallow
              >
                {referredBy.name}
              </Link>
            </ReferralName>
          )}
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
          <Typography variant="subtitle1">
            {formatLanguage(locale, languages)}
          </Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Time Zone')}
          </ContactOtherTextLabel>
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
