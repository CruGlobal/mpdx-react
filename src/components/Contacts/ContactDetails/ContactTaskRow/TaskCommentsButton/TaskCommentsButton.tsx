import { Button, styled, Theme, Typography } from '@material-ui/core';
import { ChatBubbleOutline } from '@material-ui/icons';
import React from 'react';

const TaskRowWrap = styled(Button)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 32,
  width: 58,
  borderRadius: 4,
  border: `1px solid ${theme.palette.text.secondary}`,
  margin: theme.spacing(2),
}));

const TaskCommentIcon = styled(ChatBubbleOutline)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const TaskCommentNumber = styled(Typography)(
  ({ theme, isComplete }: { theme: Theme; isComplete: boolean }) => ({
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
}

export const TaskCommentsButton: React.FC<TaskCommentsButtonProps> = ({
  isComplete,
  numberOfComments = 0,
  onClick,
}) => {
  return (
    <TaskRowWrap onClick={() => onClick()}>
      <TaskCommentIcon />
      <TaskCommentNumber isComplete={isComplete}>
        {numberOfComments}
      </TaskCommentNumber>
    </TaskRowWrap>
  );
};
