import { Box, Button, Divider, styled, Typography } from '@material-ui/core';
import { Create } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useContactDetailsTabQuery } from './ContactDetailsTab.generated';

const ContactDetailsTabContainer = styled(Box)(() => ({
  width: '100%',
  padding: '0 5%',
}));

const ContactDetailSectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0),
  paddingTop: '4px',
  margin: 0,
  alignContent: 'start',
}));

const ContactDetailHeadingContainer = styled(Box)(() => ({
  display: 'flex',
  alignContent: 'center',
}));

const ContactDetailHeadingIcon = styled(Create)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: '#9C9FA1',
}));

const ContactDeleteButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  margin: theme.spacing(5, 'auto'),
  borderRadius: '4px',
}));

const ContactDetailHeadingText = styled(Typography)(() => ({
  flexGrow: 5,
}));

interface ContactDetailTabProps {
  accountListId: string;
  contactId: string;
}

export const ContactDetailsTab: React.FC<ContactDetailTabProps> = ({
  accountListId,
  contactId,
}) => {
  const { data, loading } = useContactDetailsTabQuery({
    variables: { accountListId, contactId },
  });

  const { t } = useTranslation();

  return (
    <ContactDetailsTabContainer>
      {
        // Tag Section
      }
      <ContactDetailHeadingContainer></ContactDetailHeadingContainer>
      <Divider />
      {
        // People Section
      }
      <ContactDetailSectionContainer>
        <ContactDetailHeadingContainer>
          <ContactDetailHeadingText variant="h6">
            {loading ? t('Loading') : data.contact.name}
          </ContactDetailHeadingText>
          <ContactDetailHeadingIcon />
        </ContactDetailHeadingContainer>
      </ContactDetailSectionContainer>
      <Divider />
      {
        // Mailing Section
      }
      <ContactDetailSectionContainer>
        <ContactDetailHeadingContainer>
          <ContactDetailHeadingText variant="h6">
            {t('Mailing')}
          </ContactDetailHeadingText>
          <ContactDetailHeadingIcon />
        </ContactDetailHeadingContainer>
      </ContactDetailSectionContainer>
      <Divider />
      {
        // other Section
      }
      <ContactDetailSectionContainer>
        <ContactDetailHeadingContainer>
          <ContactDetailHeadingText variant="h6">
            {t('Other')}
          </ContactDetailHeadingText>
          <ContactDetailHeadingIcon />
        </ContactDetailHeadingContainer>
      </ContactDetailSectionContainer>
      <Divider />
      <ContactDeleteButton variant="outlined" color="default">
        {t('delete contact').toLocaleUpperCase()}
      </ContactDeleteButton>
    </ContactDetailsTabContainer>
  );
};
