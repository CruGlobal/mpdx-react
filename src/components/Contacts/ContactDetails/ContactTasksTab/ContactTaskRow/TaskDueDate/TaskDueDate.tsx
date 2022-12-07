import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { DateTime } from 'luxon';
import React from 'react';

const TaskRowWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: theme.spacing(1),
}));

const TaskCommentIcon = styled(CalendarToday, {
  shouldForwardProp: (prop) => prop !== 'isLate' && prop !== 'small',
})<{ isLate?: boolean; small: boolean }>(({ isLate, small }) => ({
  width: small ? 16 : 20,
  height: small ? 16 : 20,
  color: isLate ? theme.palette.error.main : theme.palette.text.secondary,
}));

const DueDate = styled(Typography, {
  shouldForwardProp: (prop) =>
    prop !== 'isLate' && prop !== 'isComplete' && prop !== 'small',
})<{ isLate?: boolean; isComplete: boolean; small: boolean }>(
  ({ isLate, isComplete, small }) => ({
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
