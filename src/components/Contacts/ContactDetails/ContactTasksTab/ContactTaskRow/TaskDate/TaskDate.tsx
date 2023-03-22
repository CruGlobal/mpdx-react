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

const DateText = styled(Typography, {
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

interface TaskDateProps {
  isComplete: boolean;
  taskDate: DateTime | null;
  small?: boolean;
}

export const TaskDate: React.FC<TaskDateProps> = ({
  isComplete,
  taskDate,
  small,
}) => {
  if (!taskDate) return null;
  const isLate = isComplete ? false : taskDate < DateTime.local();
  const showYear = taskDate.year !== DateTime.local().year;
  // const showYear =
  //   new Date(taskDate.toString()).getFullYear() !==
  //   new Date(DateTime.local().toString()).getFullYear();

  return (
    <TaskRowWrap>
      <TaskCommentIcon isLate={isLate} small={small || false} />
      <DateText isLate={isLate} isComplete={isComplete} small={small || false}>
        {taskDate.toFormat(showYear ? 'MMM dd, yy' : 'MMM dd')}
      </DateText>
    </TaskRowWrap>
  );
};
