import { Box, Button, makeStyles, styled } from '@material-ui/core';
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

const useStyles = makeStyles(() => ({
  contactDetailHeadingText: {
    flexGrow: 5,
  },
}));

interface ContactDetailTabProps {
  contact: ContactDetailQuery;
}

export const ContactDetailTab: React.FC<ContactDetailTabProps> = ({
  contact,
}) => {
  const classes = useStyles();
  const calledContact = contact.contact;
  const { t } = useTranslation();

  return (
    <Box style={{ width: '100%', paddingRight: '5%', paddingLeft: '5%' }}>
      {
        // Tag Section
      }
      <ContactDetailHeadingContainer></ContactDetailHeadingContainer>
      <hr />
      {
        // People Section
      }
      <ContactDetailSectionContainer>
        <ContactDetailHeadingContainer>
          <h6 className={classes.contactDetailHeadingText}>
            {calledContact.name}
          </h6>
          <ContactDetailHeadingIcon />
        </ContactDetailHeadingContainer>
      </ContactDetailSectionContainer>
      <hr />
      {
        // Mailing Section
      }
      <ContactDetailSectionContainer>
        <ContactDetailHeadingContainer>
          <h6 className={classes.contactDetailHeadingText}>{t('Mailing')}</h6>
          <ContactDetailHeadingIcon />
        </ContactDetailHeadingContainer>
      </ContactDetailSectionContainer>
      <hr />
      {
        // other Section
      }
      <ContactDetailSectionContainer>
        <ContactDetailHeadingContainer>
          <h6 className={classes.contactDetailHeadingText}>{t('Other')}</h6>
          <ContactDetailHeadingIcon />
        </ContactDetailHeadingContainer>
      </ContactDetailSectionContainer>
      <hr />
      <ContactDeleteButton variant="outlined" color="default">
        {t('DELETE CONTACT').toLocaleUpperCase()}
      </ContactDeleteButton>
    </Box>
  );
};
