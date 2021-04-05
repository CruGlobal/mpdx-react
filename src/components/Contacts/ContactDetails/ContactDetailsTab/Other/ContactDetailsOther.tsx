import React from 'react';
import { Box, Link, styled, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const ContactOtherContainer = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(5),
  margin: theme.spacing(1),
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
  contact: string;
}

export const ContactDetailsOther: React.FC<ContactDetailsOtherProp> = ({}) => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t('Other')}</Typography>
      <ContactOtherContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Assignee')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">John Doe</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Preferred Contact Method')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">Phone Call</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Language')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">English</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <Typography variant="subtitle1">
            (GMT) Central Time (US & Canada)
          </Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <ContactOtherTextLabel variant="subtitle1">
            {t('Church')}
          </ContactOtherTextLabel>
          <Typography variant="subtitle1">The Church on The Corner</Typography>
        </ContactOtherTextContainer>
        <ContactOtherTextContainer>
          <Link href="http://www.google.com" target="_blank" rel="noopener">
            <Typography variant="subtitle1">www.google.com</Typography>
          </Link>
        </ContactOtherTextContainer>
      </ContactOtherContainer>
    </Box>
  );
};
