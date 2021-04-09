import { Box, Chip, Link, styled, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetContactTagsQuery,
  useUpdateContactTagsMutation,
} from './ContactTags.generated';

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
  accountListId: string;
  contactId: string;
}

export const ContactTags: React.FC<ContactTagsProps> = ({
  accountListId,
  contactId,
}) => {
  const { t } = useTranslation();
  const { data, loading } = useGetContactTagsQuery({
    variables: {
      accountListID: accountListId, // value for 'accountListID'
      contactId: contactId, // value for 'contactId'
    },
  });

  const handleTagDelete = (tag: string) => {
    console.info('You clicked the Delete tag for tag ' + tag + ' ' + contactId);
    const list = data.contact.tagList;
    const updatedTags: string[] = [];
    list.forEach((element) => {
      element != tag ? updatedTags.push(tag) : null;
    });

    const [] = useUpdateContactTagsMutation({
      variables: {
        accountList: accountListId,
        contactId: contactId,
        tagList: updatedTags,
      },
    });
  };
  const handleAddTag = () => {
    // TODO: add mutation to update tag for contact
    console.info('You clicked add contact Tag to contact' + contactId);
  };

  return (
    <ContactTagsContainer>
      {loading ? (
        <></>
      ) : (
        <>
          {data.contact.tagList.map((tag) => (
            <ContactTagChip
              key={tag}
              label={tag}
              onDelete={() => handleTagDelete(tag)}
            />
          ))}
        </>
      )}
      <Link color="textSecondary" onClick={() => handleAddTag()}>
        <ContactTagAddTagText variant="subtitle1">
          {t('add tag')}
        </ContactTagAddTagText>
      </Link>
    </ContactTagsContainer>
  );
};
