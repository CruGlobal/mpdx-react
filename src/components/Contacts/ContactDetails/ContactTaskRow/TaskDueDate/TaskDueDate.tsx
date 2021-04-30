import { Button, styled, Theme, Typography } from '@material-ui/core';
import { CalendarToday } from '@material-ui/icons';
import { DateTime } from 'luxon';
import React from 'react';

const TaskRowWrap = styled(Button)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: theme.spacing(1),
}));

const TaskCommentIcon = styled(CalendarToday)(
  ({ theme, isLate }: { theme: Theme; isLate: boolean }) => ({
    width: 20,
    height: 20,
    color: isLate ? theme.palette.error.main : theme.palette.text.secondary,
  }),
);

const DueDate = styled(Typography)(
  ({
    theme,
    isLate,
    isComplete,
  }: {
    theme: Theme;
    isLate: boolean;
    isComplete: boolean;
  }) => ({
    fontSize: 16,
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
}

export const TaskDueDate: React.FC<TaskDueDateProps> = ({
  isComplete,
  dueDate,
}) => {
  if (!dueDate) {
    return null;
  }

  const isLate = (dueDate && dueDate < DateTime.local()) || false;

  const formattedDate = dueDate.toFormat('MMM dd');

  return (
    <TaskRowWrap>
      <TaskCommentIcon isLate={isLate} />
      <DueDate isLate={isLate} isComplete={isComplete}>
        {formattedDate}
      </DueDate>
    </TaskRowWrap>
  );
};
