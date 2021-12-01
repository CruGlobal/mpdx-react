import React, { ReactElement } from 'react';
import { Box, Card, CardContent, styled } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import illustration4 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg';
import TaskDrawerCommentListItem from '../../Drawer/CommentList/Item';
import TaskDrawerCommentListForm from '../../Drawer/CommentList/Form';
import theme from '../../../../../src/theme';
import { useGetCommentsForTaskModalCommentListQuery } from './TaskListComments.generated';

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

export interface TaskModalCommentsListProps {
  taskId: string;
  accountListId: string;
}

export enum TaskModalTabsEnum {
  details = '1',
  contacts = '2',
  comments = '3',
}

const TaskModalCommentsList = ({
  taskId,
  accountListId,
}: TaskModalCommentsListProps): ReactElement => {
  const { t } = useTranslation();

  const { data, loading } = useGetCommentsForTaskModalCommentListQuery({
    variables: {
      accountListId,
      taskId,
    },
  });

  const nodes = data?.task.comments.nodes;

  return (
    <>
      <Box m={2}>
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
              <Card data-testid="TaskDrawerCommentListEmpty">
                <CardContentEmpty>
                  <ImageWrap>
                    <Image src={illustration4} alt="empty" />
                  </ImageWrap>
                  {t('No Comments to show.')}
                </CardContentEmpty>
              </Card>
            )}
            {nodes?.reduce<JSX.Element[]>((result, comment, index) => {
              return [
                ...result,
                <Box
                  data-testid={`TaskDrawerCommentListItem-${comment.id}`}
                  key={comment.id}
                >
                  <TaskDrawerCommentListItem
                    comment={comment}
                    reverse={comment.me}
                    nextComment={nodes[index + 1]}
                  />
                </Box>,
              ];
            }, [])}
          </>
        )}
      </Box>
      <TaskDrawerCommentListForm
        accountListId={accountListId}
        taskId={taskId}
      />
    </>
  );
};

export default TaskModalCommentsList;
