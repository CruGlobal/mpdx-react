import React, { ReactElement, useRef, useEffect } from 'react';
import { Theme, Box, Card, CardContent } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import illustration4 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg';
import TaskDrawerCommentListItem from './Item';
import TaskDrawerCommentListForm from './Form';
import { useGetCommentsForTaskDrawerCommentListQuery } from './TaskListComments.generated';

const useStyles = makeStyles((theme: Theme) => ({
  cardContent: {
    padding: theme.spacing(2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    height: '120px',
    marginBottom: 0,
    [theme.breakpoints.down('xs')]: {
      height: '150px',
      marginBottom: theme.spacing(2),
    },
  },
}));

interface Props {
  accountListId: string;
  taskId: string;
}

const TaskDrawerCommentList = ({
  accountListId,
  taskId,
}: Props): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { data, loading } = useGetCommentsForTaskDrawerCommentListQuery({
    variables: {
      accountListId,
      taskId,
    },
  });

  const ref = useRef<HTMLDivElement>(null);

  const nodes = data?.task.comments.nodes;

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [nodes]);

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
                <CardContent className={classes.cardContent}>
                  <img
                    src={illustration4}
                    className={classes.img}
                    alt="empty"
                  />
                  {t('No Comments to show.')}
                </CardContent>
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
      <div ref={ref} />
      <TaskDrawerCommentListForm
        accountListId={accountListId}
        taskId={taskId}
      />
    </>
  );
};

export default TaskDrawerCommentList;
