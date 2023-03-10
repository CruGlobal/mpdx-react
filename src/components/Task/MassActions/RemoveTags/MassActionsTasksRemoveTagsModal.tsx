import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as yup from 'yup';
import { Formik } from 'formik';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import Remove from '@mui/icons-material/Remove';
import {
  ContactUpdateInput,
  Task,
} from '../../../../../graphql/types.generated';
import Modal from '../../../common/Modal/Modal';
import {
  useGetTasksForAddingTagsQuery,
  useGetTaskTagListQuery,
} from '../AddTags/TasksAddTags.generated';
import { useMassActionsUpdateTasksMutation } from '../MassActionsUpdateTasks.generated';
import theme from 'src/theme';
import { TasksDocument } from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { IncompleteWarning } from '../IncompleteWarning/IncompleteWarning';

interface MassActionsTasksRemoveTagsModalProps {
  ids: string[];
  selectedIdCount: number;
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
  tagList: yup.array().of(yup.string()).default([]).nullable(),
});

export const MassActionsTasksRemoveTagsModal: React.FC<
  MassActionsTasksRemoveTagsModalProps
> = ({ handleClose, accountListId, ids, selectedIdCount }) => {
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const [updateTasks, { loading: updating }] =
    useMassActionsUpdateTasksMutation();

  const { data: tasksForTags, fetchMore } = useGetTasksForAddingTagsQuery({
    variables: {
      accountListId,
      taskIds: ids,
      numTaskIds: ids.length,
    },
  });
  const { loading: loadingTasks } = useFetchAllPages({
    fetchMore,
    pageInfo: tasksForTags?.tasks.pageInfo,
  });

  const onSubmit = async (fields: Partial<ContactUpdateInput>) => {
    const tags = fields.tagList ?? [];
    const attributes = tasksForTags?.tasks.nodes.map((task: Partial<Task>) => ({
      id: task.id ?? '',
      tagList: task?.tagList?.filter((tag) => !tags.includes(tag)),
    })) ?? [{ id: '' }];
    await updateTasks({
      variables: {
        accountListId,
        attributes,
      },
      refetchQueries: [
        {
          query: TasksDocument,
          variables: { accountListId },
        },
      ],
    });
    enqueueSnackbar(t('Tags removed from task(s)!'), {
      variant: 'success',
    });
    handleClose();
  };

  const { data: taskTagsList, loading: loadingTagsList } =
    useGetTaskTagListQuery({
      variables: {
        accountListId,
      },
    });

  const tagsData = tasksForTags?.tasks.nodes.map((task) => task.tagList) ?? [];

  const contactsTagsList = [...new Set([...tagsData.flatMap((el) => el)])];

  return (
    <Modal title={t('Remove Tags')} isOpen={true} handleClose={handleClose}>
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
              <IncompleteWarning
                selectedIdCount={selectedIdCount}
                idCount={ids.length}
              />
              <FormControl fullWidth>
                {taskTagsList?.accountList.taskTagList && tagList ? (
                  <>
                    <Typography>{t('Select tags to remove:')}</Typography>
                    {!loadingTagsList ? (
                      contactsTagsList.map((tag) =>
                        !tagList.includes(String(tag)) ? (
                          <ExistingTagButton
                            key={tag}
                            onClick={() =>
                              setFieldValue('tagList', [...tagList, tag])
                            }
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
                disabled={
                  loadingTasks ||
                  !isValid ||
                  isSubmitting ||
                  tagList?.length === 0
                }
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
