import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, styled, TextField } from '@material-ui/core';
import TagIcon from '@material-ui/icons/LocalOfferOutlined';
import * as yup from 'yup';
import { Formik, FormikHelpers } from 'formik';
import { useSnackbar } from 'notistack';
import { Autocomplete } from '@material-ui/lab';
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

const ContactTagInput = styled(TextField)(({ theme }) => ({
  '&& .MuiInput-underline:before ': {
    borderBottom: 'none',
  },
  '&& .MuiInput-underline:after ': {
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  '&& .MuiInputBase-input': {
    minWidth: '200px',
  },
  '& ::placeholder': {
    color: '#2196F3',
    opacity: 1,
  },
  '& :hover::placeholder': {
    textDecoration: 'underline',
  },
  '& :focus::placeholder': {
    textDecoration: 'none',
    color: theme.palette.cruGrayMedium.main,
  },
  margin: theme.spacing(1),
  marginLeft: '0',
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

  const { data, loading } = useGetContactTagListQuery({
    variables: {
      accountListId,
    },
  });

  const tagSchema = yup.object({
    tagList: yup.array().of(yup.string()).default([]),
  });

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

  const onSubmit = async (
    { tagList }: { tagList: string[] & never[] },
    { resetForm }: FormikHelpers<{ tagList: string[] & never[] }>,
  ): Promise<void> => {
    resetForm();
    if (tagList.length === 0) return;

    const { data } = await updateContactTags({
      variables: {
        accountListId,
        contactId,
        tagList: [...contactTags, ...tagList],
      },
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
          title={t('Delete Icon')}
        />
      ))}
      <Formik
        initialValues={{ tagList: [] }}
        validationSchema={tagSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { tagList },
          handleSubmit,
          isSubmitting,
          setFieldValue,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <Autocomplete
              multiple
              freeSolo
              fullWidth
              loading={loading}
              popupIcon={<ContactTagIcon />}
              filterSelectedOptions
              value={tagList}
              options={data?.accountList?.contactTagList || []}
              renderInput={(params): ReactElement => (
                <ContactTagInput
                  {...params}
                  placeholder={t('add tag')}
                  disabled={isSubmitting || updating}
                />
              )}
              onChange={(_, tagList): void => setFieldValue('tagList', tagList)}
            />
          </form>
        )}
      </Formik>
    </ContactTagsContainer>
  );
};
