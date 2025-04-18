import React, { ReactElement } from 'react';
import { Autocomplete, Box, Button, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik, FormikHelpers } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ContactFiltersDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactTagIcon, ContactTagInput } from 'src/components/Tags/Tags';
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

const SaveButton = styled(Button)(({ theme }) => ({
  color: theme.palette.info.main,
  height: theme.spacing(4),
  fontWeight: 550,
}));

interface ContactTagsProps {
  accountListId: string;
  contactId: string;
  contactTags: string[];
}

const tagSchema = yup.object({
  tagList: yup.array().of(yup.string().required()).default([]),
});

export const ContactTags: React.FC<ContactTagsProps> = ({
  accountListId,
  contactId,
  contactTags,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateContactTags, { loading: updating }] =
    useUpdateContactTagsMutation();

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

  const handleValidation = async ({
    tagList,
  }: {
    tagList: string[] & never[];
  }): Promise<void> => {
    for (let i = 0; i < tagList.length; i++) {
      if (contactTags.includes(tagList[i])) {
        enqueueSnackbar(
          t('Cannot add duplicate tags, duplicate tag has been removed'),
          {
            variant: 'error',
          },
        );
        tagList.pop();
      }
    }
    return;
  };

  const onSubmit = async (
    { tagList }: { tagList: string[] & never[] },
    { resetForm }: FormikHelpers<{ tagList: string[] & never[] }>,
  ): Promise<void> => {
    resetForm();
    if (tagList.length === 0) {
      return;
    }

    // If a tag is in the list that isn't in contactTagList, it is a new tag, which means we need to
    // refetch the contact filters
    const newTag = tagList.some(
      (tag) => !contactTagsList?.accountList.contactTagList.includes(tag),
    );

    const { data } = await updateContactTags({
      variables: {
        accountListId,
        contactId,
        tagList: [...contactTags, ...tagList],
      },
      refetchQueries: newTag ? [ContactFiltersDocument] : [],
      optimisticResponse: {
        updateContact: {
          __typename: 'ContactUpdateMutationPayload',
          contact: {
            __typename: 'Contact',
            id: contactId,
            tagList: [...contactTags, ...tagList],
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
    <ContactTagsContainer display="flex" alignItems="center">
      <ContactTagIcon />
      {contactTags.map((tag) => (
        <ContactTagChip
          key={tag}
          label={tag}
          disabled={updating}
          onDelete={() => handleTagDelete(tag)}
          title={t('Remove')}
        />
      ))}
      <Formik
        initialValues={{ tagList: [] }}
        validationSchema={tagSchema}
        validate={handleValidation}
        onSubmit={onSubmit}
      >
        {({
          values: { tagList },
          handleSubmit,
          isSubmitting,
          setFieldValue,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <Box display="flex" alignItems="center">
              <Autocomplete
                multiple
                freeSolo
                autoSelect
                autoHighlight
                fullWidth
                loading={loading}
                filterSelectedOptions
                value={tagList}
                options={unusedTags || []}
                renderInput={(params): ReactElement => (
                  <ContactTagInput
                    {...params}
                    placeholder={t('add tag')}
                    disabled={isSubmitting || updating}
                    size="small"
                  />
                )}
                onChange={(_, tagList): void =>
                  setFieldValue('tagList', tagList)
                }
              />
              {tagList.length > 0 && (
                <SaveButton type="submit">{t('save')}</SaveButton>
              )}
            </Box>
          </form>
        )}
      </Formik>
    </ContactTagsContainer>
  );
};
