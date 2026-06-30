import React, { useId, useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Menu, MenuItem, SvgIcon } from '@mui/material';
import { StyledPrintButton } from '../../styledComponents';

export interface CsvExportMenuItem {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface CsvExportMenuProps {
  /** Text shown on the dropdown button. */
  label: string;
  /** Options rendered inside the dropdown menu. */
  items: CsvExportMenuItem[];
  /** Disables the whole dropdown button. */
  disabled?: boolean;
}

/**
 * Shared "Export CSV" dropdown shell used across reports. It owns the button,
 * menu, anchor state, and accessibility wiring; callers supply the menu items
 * and their own export handlers.
 */
export const CsvExportMenu: React.FC<CsvExportMenuProps> = ({
  label,
  items,
  disabled,
}) => {
  const buttonId = useId();
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (onClick: () => void) => {
    onClick();
    handleClose();
  };

  return (
    <>
      <StyledPrintButton
        id={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        startIcon={
          <SvgIcon fontSize="small">
            <FileDownloadIcon />
          </SvgIcon>
        }
        endIcon={<ArrowDropDownIcon />}
        onClick={handleOpen}
        disabled={disabled}
      >
        {label}
      </StyledPrintButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': buttonId }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.label}
            disabled={item.disabled}
            onClick={() => handleItemClick(item.onClick)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
