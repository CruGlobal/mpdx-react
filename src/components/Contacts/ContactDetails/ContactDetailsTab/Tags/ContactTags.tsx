import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Link, styled, TextField } from '@material-ui/core';
import TagIcon from '@material-ui/icons/LocalOfferOutlined';
import * as yup from 'yup';
import { Formik, FormikHelpers } from 'formik';
import { useSnackbar } from 'notistack';
import { useUpdateContactTagsMutation } from './ContactTags.generated';

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
  '&& .MuiFormLabel-root.Mui-focused': {
    color: theme.palette.cruGrayDark.main,
  },
  '&& .MuiInput-underline:before ': {
    borderBottom: 'none',
  },
  '&& .MuiInput-underline:after ': {
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  '&& .MuiInputBase-input': {
    marginBottom: '13px',
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

  const tagSchema = yup.object({
    tag: yup
      .string()
      .notOneOf(contactTags, 'A tag of that value already exist')
      .required(),
  });

  const handleTagDelete = async (tag: string) => {
    const index = contactTags.indexOf(tag);

    if (index > -1) {
      const tagList = [...contactTags];
      tagList.splice(index, 1);
      try {
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
      } catch (error) {
        enqueueSnackbar(error.message, { variant: 'error' });
        throw error;
      }
    }
  };

  const onSubmit = async (
    { tag }: { tag: string },
    { resetForm }: FormikHelpers<{ tag: string }>,
  ): Promise<void> => {
    try {
      resetForm();
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
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
      throw error;
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
      <Link color="textSecondary">
        <Formik
          initialValues={{ tag: '' }}
          validationSchema={tagSchema}
          onSubmit={onSubmit}
        >
          {({
            values: { tag },
            handleChange,
            handleSubmit,
            isSubmitting,
            errors,
            touched,
          }): ReactElement => (
            <form onSubmit={handleSubmit} noValidate>
              <ContactTagInput
                value={tag}
                label={t('add tag')}
                inputProps={{ 'aria-label': t('Tag') }}
                disabled={isSubmitting || updating}
                onChange={handleChange('tag')}
                error={!!errors.tag && touched.tag}
                helperText={errors.tag && touched.tag && t(`${errors.tag}`)}
                onKeyPress={(event): void => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    handleSubmit();
                    event.preventDefault();
                  }
                }}
              />
            </form>
          )}
        </Formik>
      </Link>
    </ContactTagsContainer>
  );
};
