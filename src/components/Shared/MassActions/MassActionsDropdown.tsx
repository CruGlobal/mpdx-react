import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';

const ActionsButton = styled(Button)(({ theme }) => ({
  width: 114,
  height: 48,
  border: '1px solid #383F43',
  backgroundColor: theme.palette.mpdxBlue.main,
  color: theme.palette.common.white,
  borderWidth: '0 !important',
  '&:hover': {
    backgroundColor: '#006193',
  },
}));

interface MassActionsDropdownProps {
  handleClick: (event: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactElement;
  disabled?: boolean;
  open: boolean;
}

export const MassActionsDropdown: React.FC<MassActionsDropdownProps> = ({
  handleClick,
  children,
  disabled = false,
  open,
}) => (
  <ActionsButton
    aria-haspopup
    aria-expanded={open}
    onClick={handleClick}
    endIcon={<ArrowDropDown />}
    color="inherit"
    disabled={disabled}
  >
    {children}
  </ActionsButton>
);
