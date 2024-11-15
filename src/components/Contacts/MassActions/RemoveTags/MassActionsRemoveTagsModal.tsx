import React, { ReactElement } from 'react';
import Remove from '@mui/icons-material/Remove';
import {
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
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { Contact, ContactUpdateInput } from 'src/graphql/types.generated';
import theme from 'src/theme';
import Modal from '../../../common/Modal/Modal';
import { useGetContactTagListQuery } from '../../ContactDetails/ContactDetailsTab/Tags/ContactTags.generated';
import { useGetContactsForTagsQuery } from '../GetContactsForTags.generated';
import { useMassActionsUpdateContactsMutation } from '../MassActionsUpdateContacts.generated';

interface MassActionsRemoveTagsModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

const ExistingTagButton = styled(Button)(() => ({
  textTransform: 'none',
  width: 'fit-content',
}));

const SelectedTagButton = styled(Button)(() => ({
  textTransform: 'none',
  textDecoration: 'line-through',
  color: theme.palette.cruGrayMedium.main,
  width: 'fit-content',
  '&:hover': {
    textDecoration: 'line-through',
  },
}));

const RemoveTagIcon = styled(Remove)(() => ({
  color: theme.palette.info.main,
}));

const tagSchema = yup.object({
  tagList: yup.array().of(yup.string().required()).default([]).nullable(),
});

export const MassActionsRemoveTagsModal: React.FC<
  MassActionsRemoveTagsModalProps
> = ({ handleClose, accountListId, ids }) => {
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const [updateContacts, { loading: updating }] =
    useMassActionsUpdateContactsMutation();

  const { data: contactsForTags } = useGetContactsForTagsQuery({
    variables: {
      accountListId,
      contactIds: ids,
      numContactIds: ids.length,
    },
  });

  const onSubmit = async (fields: Partial<ContactUpdateInput>) => {
    const tags = fields.tagList ?? [];
    const attributes = contactsForTags?.contacts.nodes.map(
      (contact: Partial<Contact>) => ({
        id: contact.id ?? '',
        tagList: contact?.tagList?.filter((tag) => !tags.includes(tag)),
      }),
    ) ?? [{ id: '' }];
    await updateContacts({
      variables: {
        accountListId,
        attributes,
      },
      refetchQueries: [
        {
          query: ContactsDocument,
          variables: { accountListId },
        },
      ],
    });
    enqueueSnackbar(t('Tags removed from contacts!'), {
      variant: 'success',
    });
    handleClose();
  };

  const { data: contactTagsList, loading } = useGetContactTagListQuery({
    variables: {
      accountListId,
    },
  });

  const tagsData =
    contactsForTags?.contacts.nodes.map((contact) => contact.tagList) ?? [];

  const contactsTagsList = [...new Set([...tagsData.flatMap((el) => el)])];

  return (
    <Modal title={t('Remove Tags')} isOpen={true} handleClose={handleClose}>
      <Formik
        initialValues={{
          tagList: [] as string[],
        }}
        onSubmit={onSubmit}
        validationSchema={tagSchema}
      >
        {({
          values: { tagList },
          setFieldValue,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form
            onSubmit={handleSubmit}
            noValidate
            data-testid="RemoveTagsModal"
          >
            <DialogContent dividers>
              <FormControl fullWidth>
                {contactTagsList?.accountList.contactTagList && tagList ? (
                  <>
                    <Typography>{t('Select tags to remove:')}</Typography>
                    {!loading ? (
                      contactsTagsList.map((tag) =>
                        !tagList.includes(String(tag)) ? (
                          <ExistingTagButton
                            key={tag}
                            onClick={() =>
                              setFieldValue('tagList', [...tagList, tag])
                            }
                            color="inherit"
                          >
                            <RemoveTagIcon />
                            {tag}
                          </ExistingTagButton>
                        ) : (
                          <SelectedTagButton
                            key={tag}
                            onClick={() =>
                              setFieldValue(
                                'tagList',
                                tagList.filter((t: string) => t !== tag),
                              )
                            }
                          >
                            {tag}
                          </SelectedTagButton>
                        ),
                      )
                    ) : (
                      <CircularProgress color="primary" size={20} />
                    )}
                  </>
                ) : null}
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
