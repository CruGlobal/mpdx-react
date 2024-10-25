import React, { useMemo } from 'react';
import { Button, ButtonProps, Icon, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ActionStyleEnum } from 'src/graphql/types.generated';
import { ActionFragment } from '../Announcements.generated';

const StyledButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

interface BannerButtonProps {
  action: ActionFragment;
  handlePerformAction: (action?: ActionFragment) => void;
  textAndIconColor: string;
}

export const BannerButton: React.FC<BannerButtonProps> = ({
  action,
  handlePerformAction,
  textAndIconColor,
}) => {
  const buttonProps: ButtonProps = useMemo(() => {
    const defaultButtonProps: ButtonProps = {
      color: 'primary',
      variant: 'contained',
    };
    switch (action.style) {
      case ActionStyleEnum.Reverse:
        return {
          sx: { borderColor: textAndIconColor },
          variant: 'outlined',
        };
      case ActionStyleEnum.Link:
        return {
          sx: { color: textAndIconColor },
          variant: 'text',
        };
      case ActionStyleEnum.Success:
        return {
          ...defaultButtonProps,
          color: 'success',
        };
      case ActionStyleEnum.Danger:
        return {
          ...defaultButtonProps,
          color: 'error',
        };
      case ActionStyleEnum.Info:
        return {
          ...defaultButtonProps,
          color: 'info',
        };

      case ActionStyleEnum.Warning:
        return {
          ...defaultButtonProps,
          color: 'warning',
        };
      case ActionStyleEnum.Secondary:
        return {
          ...defaultButtonProps,
          color: 'secondary',
        };
      case ActionStyleEnum.Info:
      case ActionStyleEnum.Default:
      default:
        return {
          ...defaultButtonProps,
          sx: { color: textAndIconColor },
        };
    }
  }, [action.style, textAndIconColor]);

  const handleClick = () => {
    handlePerformAction(action);
  };

  return action.style === ActionStyleEnum.Icon ? (
    <IconButton
      sx={{ color: textAndIconColor, marginRight: 1 }}
      key={action.id}
      onClick={handleClick}
    >
      <Icon baseClassName="far" className={`fa-${action.label}`} />
    </IconButton>
  ) : (
    <StyledButton {...buttonProps} onClick={handleClick}>
      {action.label}
    </StyledButton>
  );
};
