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
import Add from '@mui/icons-material/Add';
import * as yup from 'yup';
import { Formik } from 'formik';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { ContactUpdateInput } from '../../../../../graphql/types.generated';
import Modal from '../../../common/Modal/Modal';
import {
  ContactTagIcon,
  ContactTagInput,
} from '../../../Contacts/ContactDetails/ContactDetailsTab/Tags/ContactTags';
import {
  useGetTasksForAddingTagsQuery,
  useGetTaskTagListQuery,
  useTasksAddTagsMutation,
} from './TasksAddTags.generated';
import theme from 'src/theme';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface MassActionsTasksAddTagsModalProps {
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
  tagList: yup.array().of(yup.string()).default([]).nullable(),
});

export const MassActionsTasksAddTagsModal: React.FC<
  MassActionsTasksAddTagsModalProps
> = ({ handleClose, accountListId, ids }) => {
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const [tasksAddTags, { loading: updating }] = useTasksAddTagsMutation();

  const { data: tasksForTags } = useGetTasksForAddingTagsQuery({
    variables: {
      accountListId,
      tasksFilters: {
        ids,
      },
    },
  });

  const onSubmit = async (fields: Partial<ContactUpdateInput>) => {
    const tags = fields.tagList ?? [];
    const attributes =
      tasksForTags?.tasks.nodes.map((task) => ({
        id: task.id,
        tagList: [...new Set([...tags, ...task.tagList])],
      })) ?? [];
    await tasksAddTags({
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
    enqueueSnackbar(t('Tags added to tasks!'), {
      variant: 'success',
    });
    handleClose();
  };

  const { data: taskTagsList, loading } = useGetTaskTagListQuery({
    variables: {
      accountListId,
    },
  });

  return (
    <Modal title={t('Add Tags')} isOpen={true} handleClose={handleClose}>
      <Formik
        initialValues={{
          tagList: [],
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
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <FormControl fullWidth>
                {taskTagsList?.accountList.taskTagList && tagList ? (
                  <>
                    <Typography>{t('Choose an existing tag:')}</Typography>
                    {taskTagsList?.accountList.taskTagList
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
