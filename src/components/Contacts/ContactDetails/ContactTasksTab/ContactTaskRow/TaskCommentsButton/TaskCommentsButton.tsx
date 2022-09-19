import { Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import React from 'react';

const TaskRowWrap = styled(Button)(
  ({ small, detailsPage }: { small: boolean; detailsPage: boolean }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: small ? 24 : 32,
    width: small ? 48 : 58,
    borderRadius: 4,
    border: `1px solid ${theme.palette.text.secondary}`,
    margin: theme.spacing(detailsPage ? 1 : 2),
    marginTop: small ? 0 : theme.spacing(detailsPage ? 1 : 2),
  }),
);

const TaskCommentIcon = styled(ChatBubbleOutline)(
  ({ small }: { small: boolean }) => ({
    color: theme.palette.text.secondary,
    fontSize: small ? 16 : 20,
  }),
);

const TaskCommentNumber = styled(Typography)(
  ({ isComplete }: { isComplete: boolean }) => ({
    color: isComplete
      ? theme.palette.text.secondary
      : theme.palette.text.primary,
    margin: theme.spacing(0.5),
  }),
);

interface TaskCommentsButtonProps {
  isComplete: boolean;
  numberOfComments: number;
  onClick: () => void;
  small?: boolean;
  detailsPage?: boolean;
}

export const TaskCommentsButton: React.FC<TaskCommentsButtonProps> = ({
  isComplete,
  numberOfComments = 0,
  onClick,
  small,
  detailsPage,
}) => {
  return (
    <TaskRowWrap
      onClick={() => onClick()}
      small={small || false}
      detailsPage={detailsPage || false}
    >
      <TaskCommentIcon titleAccess="Comment Icon" small={small || false} />
      <TaskCommentNumber isComplete={isComplete}>
        {numberOfComments}
      </TaskCommentNumber>
    </TaskRowWrap>
  );
};
