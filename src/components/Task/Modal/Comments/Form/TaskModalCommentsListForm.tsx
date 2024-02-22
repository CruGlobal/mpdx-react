import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { Box, TextField } from '@mui/material';
import { Formik, FormikHelpers } from 'formik';
import { motion } from 'framer-motion';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useCreateTaskCommentMutation } from 'src/components/Task/Modal/Comments/Form/CreateTaskComment.generated';
import {
  TaskRowFragment,
  TaskRowFragmentDoc,
} from 'src/components/Task/TaskRow/TaskRow.generated';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { TaskCommentCreateInput } from 'src/graphql/types.generated';
import { useUser } from 'src/hooks/useUser';
import {
  GetCommentsForTaskModalCommentListDocument,
  GetCommentsForTaskModalCommentListQuery,
  GetCommentsForTaskModalCommentListQueryVariables,
} from '../TaskListComments.generated';
import { CommentSchemaAttributes, commentSchema } from './commentSchema';

interface Props {
  accountListId: string;
  taskId: string;
  handleFormClose: Dispatch<SetStateAction<boolean>>;
}

export const TaskModalCommentsListForm = ({
  accountListId,
  taskId,
  handleFormClose,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const user = useUser();
  const onSubmit = async (
    values: CommentSchemaAttributes,
    { resetForm }: FormikHelpers<TaskCommentCreateInput>,
  ): Promise<void> => {
    const id = uuidv4();
    const body = values.body.trim();
    resetForm();
    createTaskComment({
      variables: { accountListId, taskId, attributes: { id, body } },
      optimisticResponse: {
        createTaskComment: {
          comment: {
            __typename: 'Comment',
            id,
            body,
            updatedAt: DateTime.local().toISO(),
            me: true,
            person: user
              ? {
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                }
              : null,
          },
        },
      },
      update: (cache, { data }) => {
        const comment = data?.createTaskComment?.comment;
        if (!comment) {
          return;
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
                  nodes: [...taskComments.task.comments.nodes, comment],
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
                totalCount: taskRow.comments.totalCount + 1,
              },
            },
        );
      },
    });
    handleFormClose(false);
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Box>
        <Formik
          initialValues={{ body: '' }}
          validationSchema={commentSchema}
          validateOnMount
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
              <Box width="100%" display="flex" justifyContent="end">
                <SubmitButton size="small" disabled={!isValid || isSubmitting}>
                  {t('Save')}
                </SubmitButton>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </motion.div>
  );
};
