import { Box, styled, Theme, Typography } from '@material-ui/core';
import { CalendarToday } from '@material-ui/icons';
import { DateTime } from 'luxon';
import React from 'react';

const TaskRowWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: theme.spacing(1),
}));

const TaskCommentIcon = styled(CalendarToday)(
  ({
    theme,
    isLate,
    small,
  }: {
    theme: Theme;
    isLate: boolean;
    small: boolean;
  }) => ({
    width: small ? 16 : 20,
    height: small ? 16 : 20,
    color: isLate ? theme.palette.error.main : theme.palette.text.secondary,
  }),
);

const DueDate = styled(Typography)(
  ({
    theme,
    isLate,
    isComplete,
    small,
  }: {
    theme: Theme;
    isLate: boolean;
    isComplete: boolean;
    small: boolean;
  }) => ({
    fontSize: small ? 12 : 16,
    color: isLate
      ? theme.palette.error.main
      : isComplete
      ? theme.palette.text.secondary
      : theme.palette.text.primary,
    marginLeft: theme.spacing(1),
  }),
);

interface TaskDueDateProps {
  isComplete: boolean;
  dueDate: DateTime | null;
  small?: boolean;
}

export const TaskDueDate: React.FC<TaskDueDateProps> = ({
  isComplete,
  dueDate,
  small,
}) => {
  if (!dueDate) {
    return null;
  }

  const isLate = dueDate < DateTime.local();

  return (
    <TaskRowWrap>
      <TaskCommentIcon isLate={isLate} small={small || false} />
      <DueDate isLate={isLate} isComplete={isComplete} small={small || false}>
        {dueDate.toFormat('MMM dd')}
      </DueDate>
    </TaskRowWrap>
  );
};
