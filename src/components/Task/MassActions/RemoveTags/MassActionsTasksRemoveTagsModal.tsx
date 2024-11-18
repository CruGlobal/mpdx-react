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
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { ContactUpdateInput, Task } from 'src/graphql/types.generated';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import theme from 'src/theme';
import Modal from '../../../common/Modal/Modal';
import {
  useGetTaskTagListQuery,
  useGetTasksForAddingTagsQuery,
} from '../AddTags/TasksAddTags.generated';
import { IncompleteWarning } from '../IncompleteWarning/IncompleteWarning';
import { useMassActionsUpdateTasksMutation } from '../MassActionsUpdateTasks.generated';

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
  tagList: yup.array().of(yup.string().required()).default([]).nullable(),
});

export const MassActionsTasksRemoveTagsModal: React.FC<
  MassActionsTasksRemoveTagsModalProps
> = ({ handleClose, accountListId, ids, selectedIdCount }) => {
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const [updateTasks, { loading: updating }] =
    useMassActionsUpdateTasksMutation();
  const { update } = useUpdateTasksQueries();

  const {
    data: tasksForTags,
    error,
    fetchMore,
  } = useGetTasksForAddingTagsQuery({
    variables: {
      accountListId,
      taskIds: ids,
      numTaskIds: ids.length,
    },
  });
  const { loading: loadingTasks } = useFetchAllPages({
    fetchMore,
    error,
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
    });
    update();
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
