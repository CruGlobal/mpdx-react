import { Button, styled, Theme, Typography } from '@material-ui/core';
import { CalendarToday } from '@material-ui/icons';
import React from 'react';
import { dayMonthFormat } from '../../../../../lib/intlFormat';

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
  isLate: boolean;
  isComplete: boolean;
  dueDate: Date;
}

export const TaskDueDate: React.FC<TaskDueDateProps> = ({
  isLate,
  isComplete,
  dueDate,
}) => {
  const formattedDate = dayMonthFormat(dueDate.getDay(), dueDate.getMonth());

  return (
    <TaskRowWrap>
      <TaskCommentIcon isLate={isLate} />
      <DueDate isLate={isLate} isComplete={isComplete}>
        {formattedDate}
      </DueDate>
    </TaskRowWrap>
  );
};
