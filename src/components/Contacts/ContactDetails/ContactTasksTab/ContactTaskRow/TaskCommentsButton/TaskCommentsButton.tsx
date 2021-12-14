import { Button, styled, Theme, Typography } from '@material-ui/core';
import { ChatBubbleOutline } from '@material-ui/icons';
import React from 'react';

const TaskRowWrap = styled(Button)(
  ({ theme, small }: { theme: Theme; small: boolean }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: small ? 24 : 32,
    width: small ? 48 : 58,
    borderRadius: 4,
    border: `1px solid ${theme.palette.text.secondary}`,
    margin: theme.spacing(2),
    marginTop: small ? 0 : theme.spacing(2),
  }),
);

const TaskCommentIcon = styled(ChatBubbleOutline)(
  ({ theme, small }: { theme: Theme; small: boolean }) => ({
    color: theme.palette.text.secondary,
    fontSize: small ? 16 : 20,
  }),
);

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
  small?: boolean;
}

export const TaskCommentsButton: React.FC<TaskCommentsButtonProps> = ({
  isComplete,
  numberOfComments = 0,
  onClick,
  small,
}) => {
  return (
    <TaskRowWrap onClick={() => onClick()} small={small || false}>
      <TaskCommentIcon titleAccess="Comment Icon" small={small || false} />
      <TaskCommentNumber isComplete={isComplete}>
        {numberOfComments}
      </TaskCommentNumber>
    </TaskRowWrap>
  );
};
