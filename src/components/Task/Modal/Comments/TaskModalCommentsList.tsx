import React, { ReactElement, useState } from 'react';
import Add from '@mui/icons-material/Add';
import {
  Box,
  Card,
  CardContent,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { MultilineSkeleton } from 'src/components/Shared/MultilineSkeleton';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import illustration4 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg';
import theme from '../../../../theme';
import { TaskModalCommentsListForm } from './Form/TaskModalCommentsListForm';
import TaskModalCommentsListItem from './Item/TaskModalCommentListItem';
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

// const CommentListContainer = styled(Box)(() => ({
//   width: '20vw',
//   height: '60vh',
//   overflowY: 'auto',
//   [theme.breakpoints.down('md')]: {
//     width: '30vw',
//   },
//   [theme.breakpoints.down('sm')]: {
//     width: '90vw',
//     height: '80vh',
//   },
// }));

export interface TaskModalCommentsListProps {
  taskId: string;
  accountListId: string;
  onClose: () => void;
  commentCount?: number;
}

export const TaskModalCommentsList = ({
  taskId,
  accountListId,
  onClose,
  commentCount,
}: TaskModalCommentsListProps): ReactElement => {
  const { t } = useTranslation();

  const { data, loading } = useGetCommentsForTaskModalCommentListQuery({
    variables: {
      accountListId,
      taskId,
    },
  });

  const nodes = data?.task.comments.nodes;

  const [showNewCommentInput, setShowNewCommentInput] = useState(false);

  return (
    <>
      <DialogContent dividers>
        {loading ? (
          <Box data-testid="TaskModalCommentListLoading">
            <MultilineSkeleton
              lines={commentCount ?? 3}
              sx={{ m: 0, mb: 2, height: '4em' }}
            />
          </Box>
        ) : (
          <>
            {nodes?.length === 0 && (
              <Card
                data-testid="TaskModalCommentListEmpty"
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
                  <Typography>{t('No comments to show')}</Typography>
                </CardContentEmpty>
              </Card>
            )}
            {nodes?.map((comment) => (
              <Box
                data-testid={`TaskModalCommentsListItem-${comment.id}`}
                key={comment.id}
              >
                <TaskModalCommentsListItem taskId={taskId} comment={comment} />
              </Box>
            ))}
            {showNewCommentInput && (
              <TaskModalCommentsListForm
                accountListId={accountListId}
                taskId={taskId}
                handleFormClose={setShowNewCommentInput}
              />
            )}
            <SubmitButton
              size="large"
              type="button"
              onClick={() => setShowNewCommentInput(true)}
            >
              <Add style={{ marginRight: theme.spacing(1) }} />{' '}
              {t('Add Comment')}
            </SubmitButton>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <SubmitButton type="button" onClick={onClose}>
          {t('Done')}
        </SubmitButton>
      </DialogActions>
    </>
  );
};
