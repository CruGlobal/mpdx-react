import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { Box, TextField } from '@mui/material';
import { Formik, FormikHelpers } from 'formik';
import { motion } from 'framer-motion';
import reject from 'lodash/fp/reject';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import * as yup from 'yup';
import { useCreateTaskCommentMutation } from 'src/components/Task/Modal/Comments/Form/CreateTaskComment.generated';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { TaskCommentCreateInput } from 'src/graphql/types.generated';
import { useUser } from '../../../../../hooks/useUser';
import {
  GetCommentsForTaskModalCommentListDocument,
  GetCommentsForTaskModalCommentListQuery,
} from '../TaskListComments.generated';

export const commentSchema: yup.SchemaOf<Omit<TaskCommentCreateInput, 'id'>> =
  yup.object({
    body: yup.string().trim().required(),
  });

interface Props {
  accountListId: string;
  taskId: string;
  handleFormClose: Dispatch<SetStateAction<boolean>>;
}

const TaskModalCommentsListForm = ({
  accountListId,
  taskId,
  handleFormClose,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const user = useUser();
  const onSubmit = async (
    values: TaskCommentCreateInput,
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
            id,
            body,
            createdAt: DateTime.local().toISO(),
            me: true,
            person: {
              id: user?.id || '',
              firstName: user?.firstName,
              lastName: user?.lastName,
            },
          },
        },
      },
      update: (cache, { data: updatedData }) => {
        const comment = updatedData?.createTaskComment?.comment;

        const query = {
          query: GetCommentsForTaskModalCommentListDocument,
          variables: {
            accountListId,
            taskId,
          },
        };
        const dataFromCache =
          cache.readQuery<GetCommentsForTaskModalCommentListQuery>(query);
        const data = {
          task: {
            ...dataFromCache?.task,
            comments: {
              ...dataFromCache?.task.comments,
              nodes: [
                ...reject(
                  ({ id: commentId }) => id === commentId,
                  dataFromCache?.task.comments.nodes,
                ),
                { ...comment },
              ],
            },
          },
        };
        cache.writeQuery({ ...query, data });
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

export default TaskModalCommentsListForm;
