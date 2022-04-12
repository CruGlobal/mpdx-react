import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  CircularProgress,
  Menu,
  styled,
  Typography,
} from '@material-ui/core';
import TagIcon from '@material-ui/icons/LocalOfferOutlined';
import { useSnackbar } from 'notistack';
import {
  ContactDetailsAddButton,
  ContactDetailsAddIcon,
  ContactDetailsAddText,
} from '../People/ContactDetailsTabPeople';
import {
  useGetContactTagListQuery,
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

const ContactTagIcon = styled(TagIcon)(({ theme }) => ({
  color: theme.palette.cruGrayMedium.main,
  marginRight: theme.spacing(1),
}));

const MenuContainer = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: '35ch',
    maxHeight: theme.spacing(20),
    overflowY: 'auto',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  '& .MuiMenu-list': {
    padding: 0,
  },
  '& .MuiListItemText-root': {
    margin: 0,
  },
}));

const RowContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(2),
}));

interface ContactTagsProps {
  accountListId: string;
  contactId: string;
  contactTags: string[];
}

export const ContactTags: React.FC<ContactTagsProps> = ({
  accountListId,
  contactId,
  contactTags,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [
    updateContactTags,
    { loading: updating },
  ] = useUpdateContactTagsMutation();
  const [anchorEl, setAnchorEl] = useState<EventTarget & HTMLButtonElement>();

  const { data: contactTagsList, loading } = useGetContactTagListQuery({
    variables: {
      accountListId,
    },
  });

  const unusedTags =
    contactTagsList?.accountList.contactTagList?.filter(
      (tag) => !contactTags.includes(tag),
    ) || [];

  const handleTagDelete = async (tag: string) => {
    const index = contactTags.indexOf(tag);

    if (index > -1) {
      const tagList = [...contactTags];
      tagList.splice(index, 1);

      const { data } = await updateContactTags({
        variables: {
          accountListId,
          contactId,
          tagList,
        },
      });

      if (data?.updateContact?.contact.tagList) {
        enqueueSnackbar(t('Tag successfully removed'), {
          variant: 'success',
        });
      }
    }
  };

  const addTag = async (tag: string): Promise<void> => {
    const { data } = await updateContactTags({
      variables: {
        accountListId,
        contactId,
        tagList: [...contactTags, tag],
      },
      optimisticResponse: {
        updateContact: {
          __typename: 'ContactUpdateMutationPayload',
          contact: {
            __typename: 'Contact',
            id: contactId,
            tagList: [...contactTags, tag],
          },
        },
      },
    });

    if (data?.updateContact?.contact.tagList) {
      enqueueSnackbar(t('Tag successfully added'), {
        variant: 'success',
      });
    }
  };
  return (
    <>
      {!loading ? (
        <ContactTagsContainer display="flex" alignItems="center">
          <ContactTagIcon />
          {contactTags.map((tag) => (
            <ContactTagChip
              key={tag}
              label={tag}
              disabled={updating}
              onDelete={() => handleTagDelete(tag)}
              title={t('Delete Icon')}
            />
          ))}
          <ContactDetailsAddButton
            aria-controls="add-tag"
            aria-haspopup="true"
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            <ContactDetailsAddIcon />
            <ContactDetailsAddText>{t('Add Tag')}</ContactDetailsAddText>
          </ContactDetailsAddButton>
          <MenuContainer
            id="add-menu"
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(undefined)}
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            {unusedTags.length > 0 ? (
              unusedTags.map((tag) => (
                <RowContainer key={tag} onClick={() => addTag(tag)}>
                  <Typography>{tag}</Typography>
                </RowContainer>
              ))
            ) : (
              <RowContainer>
                <Typography>{t('You have no unused tags.')}</Typography>
              </RowContainer>
            )}
          </MenuContainer>
        </ContactTagsContainer>
      ) : (
        <LoadingIndicator size={40} />
      )}
    </>
  );
};
