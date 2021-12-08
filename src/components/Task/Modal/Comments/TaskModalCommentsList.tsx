import React, { ReactElement, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  styled,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Add } from '@material-ui/icons';
import illustration4 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg';
import TaskDrawerCommentListItem from '../../Drawer/CommentList/Item';
//import TaskDrawerCommentListForm from '../../Drawer/CommentList/Form';
import theme from '../../../../../src/theme';
import { ActionButton } from '../Form/TaskModalForm';
import { useGetCommentsForTaskModalCommentListQuery } from './TaskListComments.generated';
import TaskModalCommentsListItem from './Item/TaskModalCommentListItem';
import TaskModalCommentsListForm from './Form/TaskModalCommentsListForm';

const ImageWrap = styled(Box)(() => ({
  height: '120px',
  marginBottom: 0,
  [theme.breakpoints.down('xs')]: {
    height: '150px',
    marginBottom: theme.spacing(2),
  },
}));

const CardContentEmpty = styled(CardContent)(() => ({
  padding: theme.spacing(2),
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const CommentListContainer = styled(Box)(() => ({
  width: '20vw',
  height: '60vh',
  overflowY: 'auto',
  [theme.breakpoints.down('md')]: {
    width: '30vw',
  },
  [theme.breakpoints.down('sm')]: {
    width: '90vw',
    height: '80vh',
  },
}));

export interface TaskModalCommentsListProps {
  taskId: string;
  accountListId: string;
  onClose: () => void;
}

export enum TaskModalTabsEnum {
  details = '1',
  contacts = '2',
  comments = '3',
}

const TaskModalCommentsList = ({
  taskId,
  accountListId,
  onClose,
}: TaskModalCommentsListProps): ReactElement => {
  const { t } = useTranslation();

  const { data, loading } = useGetCommentsForTaskModalCommentListQuery({
    variables: {
      accountListId,
      taskId,
    },
  });

  const nodes = data?.task.comments.nodes;

  const [showNewCommentInput, setShowNewCommentInput] = useState<boolean>(
    false,
  );

  return (
    <>
      <CommentListContainer m={2} p={2}>
        {loading ? (
          <Box data-testid="TaskDrawerCommentListLoading">
            <TaskDrawerCommentListItem />
            <TaskDrawerCommentListItem reverse />
            <TaskDrawerCommentListItem />
            <TaskDrawerCommentListItem reverse />
          </Box>
        ) : (
          <>
            {nodes?.length === 0 && (
              <Card
                data-testid="TaskDrawerCommentListEmpty"
                style={{ marginBottom: theme.spacing(2) }}
              >
                <CardContentEmpty>
                  <ImageWrap>
                    <img
                      src={illustration4}
                      alt="empty"
                      style={{ height: 120, marginBottom: 0 }}
                    />
                  </ImageWrap>
                  <Typography>{t('No Comments to show.')}</Typography>
                </CardContentEmpty>
              </Card>
            )}
            {nodes?.reduce<JSX.Element[]>((result, comment) => {
              return [
                ...result,
                <Box
                  data-testid={`TaskDrawerCommentListItem-${comment.id}`}
                  key={comment.id}
                >
                  <TaskModalCommentsListItem
                    taskId={taskId}
                    comment={comment}
                  />
                </Box>,
              ];
            }, [])}
            {showNewCommentInput && (
              <TaskModalCommentsListForm
                accountListId={accountListId}
                taskId={taskId}
                handleFormClose={setShowNewCommentInput}
              />
            )}
            <ActionButton
              size="large"
              onClick={() => setShowNewCommentInput(true)}
            >
              <Add style={{ marginRight: theme.spacing(1) }} />{' '}
              {t('Add Comment')}
            </ActionButton>
          </>
        )}
      </CommentListContainer>
      <Divider />
      <Box
        display="flex"
        justifyContent="end"
        alignItems="center"
        width="100%"
        p={1}
      >
        <ActionButton size="large" onClick={onClose}>
          {t('Done')}
        </ActionButton>
      </Box>
    </>
  );
};

export default TaskModalCommentsList;
