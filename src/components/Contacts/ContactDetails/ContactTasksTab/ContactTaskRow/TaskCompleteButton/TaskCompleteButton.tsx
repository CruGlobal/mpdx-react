import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import Check from '@mui/icons-material/Check';
import React from 'react';

const ButtonWrap = styled(Button)(
  ({ isComplete }: { isComplete: boolean }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isComplete ? theme.palette.mpdxGreen.main : 'transparent',
    height: 24,
    width: 55,
    borderRadius: 26,
    border: `2px solid ${theme.palette.mpdxGreen.main}`,
    margin: theme.spacing(2),
    color: isComplete
      ? theme.palette.common.white
      : theme.palette.mpdxGreen.main,
    '&:hover': {
      backgroundColor: theme.palette.mpdxGreen.main,
      color: theme.palette.common.white,
    },
  }),
);

interface TaskCompleteButtonProps {
  isComplete: boolean;
  onClick: () => void;
}

export const TaskCompleteButton: React.FC<TaskCompleteButtonProps> = ({
  isComplete,
  onClick,
}) => {
  return (
    <ButtonWrap isComplete={isComplete} onClick={() => onClick()}>
      <Check titleAccess="Check Icon" />
    </ButtonWrap>
  );
};
