import React from 'react';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import theme from 'src/theme';

const TaskRowWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: theme.spacing(1, 0.5),
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
    marginLeft: small ? theme.spacing(0.5) : theme.spacing(1),
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
  if (!taskDate) {
    return null;
  }
  const locale = useLocale();
  const isLate = isComplete ? false : taskDate < DateTime.local();
  const showYear = taskDate.year !== DateTime.local().year;

  return (
    <TaskRowWrap>
      <TaskCommentIcon isLate={isLate} small={small || false} />
      <DateText isLate={isLate} isComplete={isComplete} small={small || false}>
        {taskDate.toJSDate().toLocaleDateString(locale, {
          day: '2-digit',
          month: 'short',
          year: showYear ? '2-digit' : undefined,
        })}
      </DateText>
    </TaskRowWrap>
  );
};
