import React from 'react';
import Check from '@mui/icons-material/Check';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';

const ButtonWrap = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isComplete' && prop !== 'isXs',
})<{ isComplete?: boolean; isXs?: boolean }>(({ isComplete, isXs }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: isComplete ? theme.palette.mpdxGreen.main : 'transparent',
  height: 24,
  width: 55,
  borderRadius: 26,
  border: `2px solid ${theme.palette.mpdxGreen.main}`,
  margin: isXs ? theme.spacing(2, 1) : theme.spacing(2),
  color: isComplete ? theme.palette.common.white : theme.palette.mpdxGreen.main,
  '&:hover': {
    backgroundColor: theme.palette.mpdxGreen.main,
    color: theme.palette.common.white,
  },
}));

interface TaskCompleteButtonProps extends ButtonProps {
  isComplete: boolean;
  isXs?: boolean;
}

export const TaskCompleteButton: React.FC<TaskCompleteButtonProps> = ({
  isComplete,
  isXs = false,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <ButtonWrap
      data-testid="checkCompleteButton"
      isComplete={isComplete}
      isXs={isXs}
      {...props}
    >
      <Check titleAccess={t('Check')} />
    </ButtonWrap>
  );
};
