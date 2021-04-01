import {
  Box,
  Button,
  Divider,
  makeStyles,
  styled,
  Typography,
} from '@material-ui/core';
import { Create } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContactDetailQuery } from '../ContactDetail.generated';

const ContactDetailSectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0),
  paddingTop: '4px',
  margin: 0,
  alignContent: 'start',
}));

const ContactDetailHeadingContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  alignItems: 'center',
}));

const ContactDetailHeadingIcon = styled(Create)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: '#9C9FA1',
}));

const ContactDeleteButton = styled(Button)(({ theme }) => ({
  display: 'block',
  padding: theme.spacing(2),
  margin: theme.spacing(5),
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const ContactDetailHeadingText = styled(Typography)(() => ({
  flexGrow: 5,
}));

interface ContactDetailTabProps {
  contact: ContactDetailQuery;
}

export const ContactDetailTab: React.FC<ContactDetailTabProps> = ({
  contact,
}) => {
  const calledContact = contact.contact;
  const { t } = useTranslation();

  return (
    <Box style={{ width: '100%', paddingRight: '5%', paddingLeft: '5%' }}>
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
            {calledContact.name}
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
        {t('DELETE CONTACT').toLocaleUpperCase()}
      </ContactDeleteButton>
    </Box>
  );
};
