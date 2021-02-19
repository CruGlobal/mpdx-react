import React, { ReactElement } from 'react';
import {
  makeStyles,
  Theme,
  Box,
  TextField,
  IconButton,
  Grid,
  Divider,
} from '@material-ui/core';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import SendIcon from '@material-ui/icons/Send';
import { useMutation, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { reject } from 'lodash/fp';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskCommentMutation } from '../../../../../../types/CreateTaskCommentMutation';
import { TaskCommentCreateInput } from '../../../../../../types/globalTypes';
import { GET_COMMENTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY } from '../CommentList';
import { GetCommentsForTaskDrawerCommentListQuery } from '../../../../../../types/GetCommentsForTaskDrawerCommentListQuery';
import { useApp } from '../../../../App';

const useStyles = makeStyles((theme: Theme) => ({
  div: {
    backgroundColor: theme.palette.background.paper,
    position: 'fixed',
    bottom: 0,
    width: 500,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  gridItem: {
    flexGrow: 1,
  },
  spacerBox: {
    height: 81,
  },
}));

export const CREATE_TASK_COMMENT_MUTATION = gql`
  mutation CreateTaskCommentMutation(
    $accountListId: ID!
    $taskId: ID!
    $attributes: TaskCommentCreateInput!
  ) {
    createTaskComment(
      input: {
        accountListId: $accountListId
        taskId: $taskId
        attributes: $attributes
      }
    ) {
      comment {
        id
        body
        createdAt
        me
        person {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

const commentSchema: yup.SchemaOf<
  Omit<TaskCommentCreateInput, 'id'>
> = yup.object({
  body: yup.string().trim().required(),
});

interface Props {
  accountListId: string;
  taskId: string;
}

const Form = ({ accountListId, taskId }: Props): ReactElement => {
  const classes = useStyles();
  const [createTaskComment] = useMutation<CreateTaskCommentMutation>(
    CREATE_TASK_COMMENT_MUTATION,
  );
  const {
    state: { user },
  } = useApp();
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
            createdAt: new Date().toISOString(),
            me: true,
            person: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          },
        },
      },
      update: (
        cache,
        {
          data: {
            createTaskComment: { comment },
          },
        },
      ) => {
        const query = {
          query: GET_COMMENTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY,
          variables: {
            accountListId,
            taskId,
          },
        };
        const dataFromCache = cache.readQuery<GetCommentsForTaskDrawerCommentListQuery>(
          query,
        );
        const data = {
          task: {
            ...dataFromCache.task,
            comments: {
              ...dataFromCache.task.comments,
              nodes: [
                ...reject(
                  ({ id: commentId }) => id === commentId,
                  dataFromCache.task.comments.nodes,
                ),
                { ...comment },
              ],
            },
          },
        };
        cache.writeQuery({ ...query, data });
      },
    });
  };
  return (
    <>
      <Box className={classes.spacerBox}></Box>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={classes.div}
      >
        <Divider />
        <Box p={2}>
          <Formik
            initialValues={{ body: '' }}
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
                <Grid container spacing={2} alignItems="center">
                  <Grid item className={classes.gridItem}>
                    <TextField
                      value={body}
                      onChange={handleChange('body')}
                      variant="outlined"
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
                  </Grid>
                  <Grid item>
                    <IconButton
                      aria-label="Send"
                      color="primary"
                      disabled={!isValid || isSubmitting}
                      type="submit"
                    >
                      <SendIcon fontSize="inherit" />
                    </IconButton>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </Box>
      </motion.div>
    </>
  );
};

export default Form;
