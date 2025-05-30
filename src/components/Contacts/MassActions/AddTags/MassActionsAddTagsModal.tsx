import React, { ReactElement } from 'react';
import Add from '@mui/icons-material/Add';
import {
  Autocomplete,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  ContactFiltersDocument,
  ContactsDocument,
} from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactTagIcon, ContactTagInput } from 'src/components/Tags/Tags';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { ContactUpdateInput } from 'src/graphql/types.generated';
import theme from 'src/theme';
import Modal from '../../../common/Modal/Modal';
import { useGetContactTagListQuery } from '../../ContactDetails/ContactDetailsTab/Tags/ContactTags.generated';
import {
  useContactsAddTagsMutation,
  useGetContactsForAddingTagsQuery,
} from './ContactsAddTags.generated';

interface MassActionsAddTagsModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

const NewTagInstructions = styled(Typography)(() => ({
  marginTop: theme.spacing(2),
  fontWeight: 550,
}));

const ExistingTagButton = styled(Button)(() => ({
  textTransform: 'none',
  width: 'fit-content',
}));

const AddTagIcon = styled(Add)(() => ({
  color: theme.palette.info.main,
}));

const tagSchema = yup.object({
  tagList: yup.array().of(yup.string().required()).default([]).nullable(),
});

export const MassActionsAddTagsModal: React.FC<
  MassActionsAddTagsModalProps
> = ({ handleClose, accountListId, ids }) => {
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const [contactsAddTags, { loading: updating }] = useContactsAddTagsMutation();

  const { data: contactsForTags } = useGetContactsForAddingTagsQuery({
    variables: {
      accountListId,
      contactIds: ids,
      numContactIds: ids.length,
    },
  });

  const handleValidation = async (fields: Partial<ContactUpdateInput>) => {
    const tags = fields.tagList ?? [];
    let existingTags: string[] = [];
    let contactNum = 0;
    contactsForTags?.contacts.nodes.forEach((contact) => {
      existingTags = [...existingTags, ...contact.tagList];
      contactNum++;
    });
    for (let i = 0; i < tags?.length; i++) {
      existingTags = [...existingTags, tags[i]];
      const duplicates = existingTags.filter(
        (item, index) => existingTags.indexOf(item) !== index,
      );
      if (duplicates.length === contactNum && duplicates.length > 0) {
        enqueueSnackbar(t('All selected contacts already have this tag'), {
          variant: 'error',
        });
        tags.pop();
      }
    }
    return;
  };

  const onSubmit = async (fields: Partial<ContactUpdateInput>) => {
    const tags = fields.tagList ?? [];
    const attributes =
      contactsForTags?.contacts.nodes.map((contact) => ({
        id: contact.id,
        tagList: [...new Set([...tags, ...contact.tagList])],
      })) ?? [];

    // If a tag is in the list that isn't in contactTagList, it is a new tag, which means we need to
    // refetch the contact filters
    const newTag = tags.some(
      (tag) => !contactTagsList?.accountList.contactTagList.includes(tag),
    );

    await contactsAddTags({
      variables: {
        accountListId,
        attributes,
      },
      refetchQueries: [
        {
          query: ContactsDocument,
          variables: { accountListId },
        },
        ...(newTag ? [ContactFiltersDocument] : []),
      ],
    });
    enqueueSnackbar(t('Tags added to contacts!'), {
      variant: 'success',
    });
    handleClose();
  };

  const { data: contactTagsList, loading } = useGetContactTagListQuery({
    variables: {
      accountListId,
    },
  });

  return (
    <Modal title={t('Add Tags')} isOpen={true} handleClose={handleClose}>
      <Formik
        initialValues={{
          tagList: [] as string[],
        }}
        onSubmit={onSubmit}
        validate={handleValidation}
        validationSchema={tagSchema}
      >
        {({
          values: { tagList },
          setFieldValue,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <FormControl fullWidth>
                {contactTagsList?.accountList.contactTagList && tagList ? (
                  <>
                    <Typography>{t('Choose an existing tag:')}</Typography>
                    {contactTagsList?.accountList.contactTagList
                      .filter((tag) => !tagList.includes(tag))
                      .map((tag) => (
                        <ExistingTagButton
                          key={tag}
                          onClick={() =>
                            setFieldValue('tagList', [...tagList, tag])
                          }
                          color="inherit"
                        >
                          <AddTagIcon />
                          {tag}
                        </ExistingTagButton>
                      ))}
                  </>
                ) : null}
              </FormControl>
              <FormControl fullWidth>
                <NewTagInstructions>
                  {t(
                    'Create New Tags (separate multiple tags with Enter key) *',
                  )}
                </NewTagInstructions>
                <Autocomplete
                  multiple
                  autoSelect
                  autoHighlight
                  freeSolo
                  fullWidth
                  loading={loading}
                  popupIcon={<ContactTagIcon />}
                  filterSelectedOptions
                  value={tagList ?? []}
                  options={[]}
                  renderInput={(params): ReactElement => (
                    <ContactTagInput
                      {...params}
                      placeholder={t('add tag')}
                      //   disabled={isSubmitting || updating}
                    />
                  )}
                  onChange={(_, tagList): void =>
                    setFieldValue('tagList', tagList)
                  }
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                disabled={!isValid || isSubmitting || tagList?.length === 0}
              >
                {updating && <CircularProgress color="primary" size={20} />}
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
