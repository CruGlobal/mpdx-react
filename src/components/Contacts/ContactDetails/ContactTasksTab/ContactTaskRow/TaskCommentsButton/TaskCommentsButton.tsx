import React from 'react';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import { Button, ButtonProps, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';

const TaskRowWrap = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'small' && prop !== 'detailsPage',
})<{ small?: boolean; detailsPage?: boolean }>(
  ({ theme, small, detailsPage }) => ({
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

const TaskCommentIcon = styled(ChatBubbleOutline, {
  shouldForwardProp: (prop) => prop !== 'small',
})<{ small?: boolean }>(({ small }) => ({
  color: theme.palette.text.secondary,
  fontSize: small ? 16 : 20,
}));

const TaskCommentNumber = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isComplete',
})<{ isComplete?: boolean }>(({ isComplete }) => ({
  color: isComplete ? theme.palette.text.secondary : theme.palette.text.primary,
  margin: theme.spacing(0.5),
}));

interface TaskCommentsButtonProps extends ButtonProps {
  isComplete: boolean;
  numberOfComments: number;
  small?: boolean;
  detailsPage?: boolean;
}

export const TaskCommentsButton: React.FC<TaskCommentsButtonProps> = ({
  isComplete,
  numberOfComments = 0,
  small,
  detailsPage,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <TaskRowWrap
      small={small || false}
      detailsPage={detailsPage || false}
      {...props}
    >
      <TaskCommentIcon titleAccess={t('Comment')} small={small || false} />
      <TaskCommentNumber isComplete={isComplete}>
        {numberOfComments}
      </TaskCommentNumber>
    </TaskRowWrap>
  );
};
