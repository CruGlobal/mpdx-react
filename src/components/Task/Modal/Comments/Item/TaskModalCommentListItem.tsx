import { Box, Typography, Tooltip, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { CommentUpdateMutationInput } from '../../../../../../graphql/types.generated';
import theme from '../../../../../../src/theme';
import {
  GetCommentsForTaskModalCommentListDocument,
  GetCommentsForTaskModalCommentListQuery,
} from '../TaskListComments.generated';
import { commentSchema } from '../Form/TaskModalCommentsListForm';
import { useDeleteCommentMutation } from './DeleteTaskComment.generated';
import { useUpdateCommentMutation } from './UpdateTaskComment.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  SubmitButton,
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface Props {
  comment?: GetCommentsForTaskModalCommentListQuery['task']['comments']['nodes'][0];
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
  const accountListId = useAccountListId();
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [body, setBody] = useState(comment?.body);
  const [editing, setEditing] = useState<boolean>(false);

  const deleteTaskComment = async (): Promise<void> => {
    await deleteComment({
      variables: {
        taskId: taskId ?? '',
        commentId: comment?.id || '',
      },
      refetchQueries: [
        {
          query: GetCommentsForTaskModalCommentListDocument,
          variables: { accountListId, taskId },
        },
      ],
    });
  };

  const onSubmit = async (
    values: Pick<CommentUpdateMutationInput, 'body'>,
  ): Promise<void> => {
    await updateComment({
      variables: {
        taskId: taskId ?? '',
        commentId: comment?.id || '',
        body: values.body,
      },
      refetchQueries: [
        {
          query: GetCommentsForTaskModalCommentListDocument,
          variables: { accountListId, taskId },
        },
      ],
    });
    toggleEditing();
  };

  const toggleEditing = (): void => {
    setEditing((prevState) => !prevState);
  };

  const cancelEdit = (): void => {
    toggleEditing();
    setBody(comment?.body);
  };

  const Details: React.FC = () => {
    return (
      <Box>
        <CommentInfoText display="inline">
          {comment?.person.firstName} {comment?.person.lastName}{' '}
        </CommentInfoText>
        <Tooltip placement="bottom" title={comment?.createdAt || ''} arrow>
          <CommentInfoText display="inline">
            {comment?.createdAt &&
              DateTime.fromISO(comment.createdAt).toLocaleString()}
          </CommentInfoText>
        </Tooltip>
      </Box>
    );
  };

  return (
    <>
      {editing ? (
        <Box>
          <Formik
            initialValues={{ body: body || '' }}
            validationSchema={commentSchema}
            onSubmit={onSubmit}
          >
            {({
              values: { body },
              handleChange,
              handleSubmit,
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
                    inputProps={{ 'aria-label': 'Body' }}
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
                  <Details />
                  <Box>
                    <CancelButton size="small" onClick={cancelEdit} />
                    <SubmitButton
                      size="small"
                      disabled={!isValid || isSubmitting}
                    >
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
            <Typography>{body}</Typography>
          </Box>
          <Box
            width="100%"
            display="flex"
            justifyContent="space-between"
            mb={2}
          >
            <Details />
            <Box>
              {editing ? (
                <SubmitButton size="small" type="button">
                  {t('Save')}
                </SubmitButton>
              ) : (
                <SubmitButton
                  size="small"
                  type="button"
                  onClick={toggleEditing}
                >
                  {t('Edit')}
                </SubmitButton>
              )}
              <DeleteButton size="small" onClick={deleteTaskComment} />
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

export default TaskModalCommentsListItem;
