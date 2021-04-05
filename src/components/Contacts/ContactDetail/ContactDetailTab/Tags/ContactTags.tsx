import { Box, Chip, styled, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactTagsContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  alignItems: 'center',
  marginLeft: '0',
  paddingLeft: '0',
}));

const ContactTagChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(1),
  marginLeft: '0',
}));

const ContactTagAddTagText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(1),
  marginLeft: '0',
}));

interface ContactTagsProps {
  contactId: string;
  contactTags: string[];
}

export const ContactTags: React.FC<ContactTagsProps> = ({
  contactId,
  contactTags,
}) => {
  const { t } = useTranslation();
  const handleTagDelete = (tag: string) => {
    console.info('You clicked the Delete tag for tag' + tag + '' + contactId);
  };
  const handleAddTag = () => {
    console.info('You clicked add contact Tag to contact' + contactId);
  };

  return (
    <ContactTagsContainer>
      {contactTags.map((tag, _index) => (
        <ContactTagChip key={tag} label={tag} onDelete={handleTagDelete} />
      ))}
      <ContactTagAddTagText variant="subtitle1" onClick={handleAddTag}>
        {t('add tag')}
      </ContactTagAddTagText>
    </ContactTagsContainer>
  );
};
