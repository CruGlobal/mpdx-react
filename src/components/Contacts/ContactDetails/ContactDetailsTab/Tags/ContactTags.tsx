import { Box, Chip, Link, styled, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactTagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignContent: 'center',
  flexWrap: 'wrap',
  margin: theme.spacing(2, 0),
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
    const index = contactTags.indexOf(tag);
    if (index > -1) {
      contactTags = contactTags.splice(index, 1);
      // TODO: add mutation to update tag for contact
    }
    console.info('You clicked the Delete tag for tag' + tag + '' + contactId);
  };
  const handleAddTag = () => {
    // TODO: add mutation to update tag for contact
    console.info('You clicked add contact Tag to contact' + contactId);
  };

  return (
    <ContactTagsContainer>
      {contactTags.map((tag, _index) => (
        <ContactTagChip key={tag} label={tag} onDelete={handleTagDelete} />
      ))}
      <Link color="textPrimary" onClick={handleAddTag}>
        <ContactTagAddTagText variant="subtitle1">
          {t('add tag')}
        </ContactTagAddTagText>
      </Link>
    </ContactTagsContainer>
  );
};
