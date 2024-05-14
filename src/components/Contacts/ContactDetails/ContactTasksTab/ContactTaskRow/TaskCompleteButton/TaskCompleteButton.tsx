import React from 'react';
import Check from '@mui/icons-material/Check';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';

const ButtonWrap = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isComplete',
})<{ isComplete?: boolean }>(({ isComplete }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: isComplete ? theme.palette.mpdxGreen.main : 'transparent',
  height: 24,
  width: 55,
  borderRadius: 26,
  border: `2px solid ${theme.palette.mpdxGreen.main}`,
  margin: theme.spacing(2),
  color: isComplete ? theme.palette.common.white : theme.palette.mpdxGreen.main,
  '&:hover': {
    backgroundColor: theme.palette.mpdxGreen.main,
    color: theme.palette.common.white,
  },
}));

interface TaskCompleteButtonProps extends ButtonProps {
  isComplete: boolean;
}

export const TaskCompleteButton: React.FC<TaskCompleteButtonProps> = ({
  isComplete,
  ...props
}) => {
  return (
    <ButtonWrap isComplete={isComplete} {...props}>
      <Check titleAccess="Check Icon" />
    </ButtonWrap>
  );
};
