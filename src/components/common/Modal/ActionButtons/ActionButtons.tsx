import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const StyledButton = styled(Button)(() => ({
  fontWeight: 700,
}));

export interface ActionButtonProps extends ButtonProps {
  dataTestId?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  dataTestId = 'action-button',
  ...props
}) => <StyledButton variant="text" data-testid={dataTestId} {...props} />;

export const SubmitButton: React.FC<ActionButtonProps> = ({
  children,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <ActionButton type="submit" color="info" {...props}>
      {children ?? t('Submit')}
    </ActionButton>
  );
};

export const DeleteButton: React.FC<ActionButtonProps> = ({
  dataTestId = 'modal-delete-button',
  children,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <ActionButton
      data-testid={dataTestId}
      color="error"
      sx={{ marginRight: 'auto' }}
      {...props}
    >
      {children ?? t('Delete')}
    </ActionButton>
  );
};

export const CancelButton: React.FC<ActionButtonProps> = ({
  children,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <ActionButton color="inherit" {...props}>
      {children ?? t('Cancel')}
    </ActionButton>
  );
};
