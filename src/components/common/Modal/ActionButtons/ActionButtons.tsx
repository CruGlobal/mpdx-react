import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const StyledButton = styled(Button)(() => ({
  fontWeight: 700,
}));

interface ActionButtonProps {
  onClick?: () => void;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  disabled?: ButtonProps['disabled'];
  type?: ButtonProps['type'];
  sx?: ButtonProps['sx'];
  variant?: ButtonProps['variant'];
  dataTestId?: string;
  children?: ButtonProps['children'];
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  size,
  color,
  disabled,
  type,
  sx,
  variant = 'text',
  dataTestId = 'action-button',
  children,
}) => {
  return (
    <StyledButton
      onClick={onClick}
      size={size}
      color={color}
      disabled={disabled}
      type={type}
      sx={sx}
      variant={variant}
      data-testid={dataTestId}
    >
      {children}
    </StyledButton>
  );
};

export const SubmitButton: React.FC<ActionButtonProps> = ({
  onClick,
  size,
  disabled,
  type = 'submit',
  variant,
  children,
}) => {
  const { t } = useTranslation();
  return (
    <ActionButton
      onClick={onClick}
      size={size}
      disabled={disabled}
      color="info"
      type={type}
      variant={variant}
    >
      {children ? children : t('Submit')}
    </ActionButton>
  );
};

export const DeleteButton: React.FC<ActionButtonProps> = ({
  onClick,
  size,
  disabled,
  variant,
  sx = { marginRight: 'auto' },
  children,
}) => {
  const { t } = useTranslation();
  return (
    <ActionButton
      onClick={onClick}
      size={size}
      disabled={disabled}
      color="error"
      sx={sx}
      variant={variant}
    >
      {children ? children : t('Delete')}
    </ActionButton>
  );
};

export const CancelButton: React.FC<ActionButtonProps> = ({
  onClick,
  size,
  disabled,
  variant,
  children,
}) => {
  const { t } = useTranslation();
  return (
    <ActionButton
      onClick={onClick}
      size={size}
      disabled={disabled}
      color="inherit"
      variant={variant}
    >
      {children ? children : t('Cancel')}
    </ActionButton>
  );
};
