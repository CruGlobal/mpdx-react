import React, { ReactElement, useState } from 'react';
import { Box, TextField, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  TaskRowFragment,
  TaskRowFragmentDoc,
} from 'src/components/Task/TaskRow/TaskRow.generated';
import {
  CancelButton,
  DeleteButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import theme from '../../../../../theme';
import { CommentSchemaAttributes, commentSchema } from '../Form/commentSchema';
import {
  GetCommentsForTaskModalCommentListDocument,
  GetCommentsForTaskModalCommentListQuery,
  GetCommentsForTaskModalCommentListQueryVariables,
  TaskModalCommentFragment,
  TaskModalCommentFragmentDoc,
} from '../TaskListComments.generated';
import { useDeleteCommentMutation } from './DeleteTaskComment.generated';
import { useUpdateCommentMutation } from './UpdateTaskComment.generated';

interface DetailsProps {
  comment: TaskModalCommentFragment;
}

const Details: React.FC<DetailsProps> = ({ comment }) => {
  const locale = useLocale();

  return (
    <Box>
      <CommentInfoText display="inline">
        {[comment.person?.firstName, comment.person?.lastName]
          .filter(Boolean)
          .join(' ')}
      </CommentInfoText>{' '}
      <Tooltip placement="bottom" title={comment.updatedAt} arrow>
        <CommentInfoText display="inline">
          {dateFormat(DateTime.fromISO(comment.updatedAt), locale)}
        </CommentInfoText>
      </Tooltip>
    </Box>
  );
};

interface Props {
  comment: TaskModalCommentFragment;
  taskId: string;
}

const CommentInfoText = styled(Typography)(() => ({
  fontSize: 12,
  color: theme.palette.cruGrayDark.main,
}));

const TaskModalCommentsListItem: React.FC<Props> = ({
  comment,
  taskId,
}: Props) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [editing, setEditing] = useState<boolean>(false);

  const deleteTaskComment = async (): Promise<void> => {
    const commentId = comment.id;
    await deleteComment({
      variables: {
        taskId,
        commentId,
      },
      optimisticResponse: {
        deleteComment: {
          id: commentId,
        },
      },
      update: (cache, { data }) => {
        if (!data) {
          return null;
        }

        cache.updateQuery<
          GetCommentsForTaskModalCommentListQuery,
          GetCommentsForTaskModalCommentListQueryVariables
        >(
          {
            query: GetCommentsForTaskModalCommentListDocument,
            variables: {
              accountListId,
              taskId,
            },
          },
          (taskComments) =>
            taskComments && {
              task: {
                ...taskComments.task,
                comments: {
                  ...taskComments.task.comments,
                  nodes: [
                    ...taskComments.task.comments.nodes.filter(
                      (comment) => comment.id !== data.deleteComment?.id,
                    ),
                  ],
                },
              },
            },
        );

        cache.updateFragment<TaskRowFragment>(
          {
            id: `Task:${taskId}`,
            fragment: TaskRowFragmentDoc,
          },
          (taskRow) =>
            taskRow && {
              ...taskRow,
              comments: {
                ...taskRow.comments,
                totalCount: taskRow.comments.totalCount - 1,
              },
            },
        );
      },
    });
  };

  const onSubmit = async (values: CommentSchemaAttributes): Promise<void> => {
    await updateComment({
      variables: {
        taskId,
        commentId: comment.id,
        body: values.body,
      },
      update: (cache, { data }) => {
        if (!data) {
          return null;
        }

        cache.updateFragment<TaskModalCommentFragment>(
          {
            id: `Comment:${comment.id}`,
            fragment: TaskModalCommentFragmentDoc,
          },
          (comment) =>
            comment && {
              ...comment,
              body: values.body,
              updatedAt: DateTime.now().toISO(),
            },
        );
      },
    });
    toggleEditing();
  };

  const toggleEditing = (): void => {
    setEditing((prevState) => !prevState);
  };

  return editing ? (
    <Box>
      <Formik
        initialValues={{ body: comment.body }}
        validationSchema={commentSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { body },
          handleChange,
          handleSubmit,
          resetForm,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <Box>
              <TextField
                value={body}
                onChange={handleChange('body')}
                fullWidth
                multiline
                inputProps={{ 'aria-label': t('Body') }}
                required
                onKeyPress={(event): void => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    handleSubmit();
                    event.preventDefault();
                  }
                }}
              />
            </Box>
            <Box
              width="100%"
              display="flex"
              justifyContent="space-between"
              mb={2}
            >
              <Details comment={comment} />
              <Box>
                <CancelButton
                  size="small"
                  onClick={() => {
                    toggleEditing();
                    resetForm();
                  }}
                />
                <SubmitButton size="small" disabled={!isValid || isSubmitting}>
                  {t('Save')}
                </SubmitButton>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  ) : (
    <>
      <Box borderBottom={`1px solid ${theme.palette.cruGrayLight.main}`}>
        <Typography whiteSpace="pre-line">{comment.body}</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between" mb={2}>
        <Details comment={comment} />
        <Box>
          <SubmitButton size="small" type="button" onClick={toggleEditing}>
            {t('Edit')}
          </SubmitButton>
          <DeleteButton size="small" onClick={deleteTaskComment} />
        </Box>
      </Box>
    </>
  );
};

export default TaskModalCommentsListItem;
