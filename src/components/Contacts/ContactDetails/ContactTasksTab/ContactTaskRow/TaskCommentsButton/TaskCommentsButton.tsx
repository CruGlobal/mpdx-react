import { Button, styled, Theme, Typography } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';
import React from 'react';

const TaskRowWrap = styled(Button)(
  ({
    theme,
    small,
    detailsPage,
  }: {
    theme: Theme;
    small: boolean;
    detailsPage: boolean;
  }) => ({
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
