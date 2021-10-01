import React from 'react';
import { TextField, Hidden, styled } from '@material-ui/core';

interface ActionsDropdownProps {
  disabled: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  value: string;
}

const PlaceholderActionsDropdown = styled(TextField)(() => ({
  minWidth: 110,
  '& .MuiInputBase-root': {
    height: 48,
  },
  '& .MuiFormLabel-root': {
    lineHeight: 0.6,
  },
}));

export const ActionsDropDown: React.FC<ActionsDropdownProps> = ({
  disabled,
  onChange,
  value,
}) => {
  return (
    <Hidden smDown>
      <PlaceholderActionsDropdown
        disabled={disabled}
        label="Actions"
        select
        onChange={(event) => onChange(event)}
        value={value}
        variant="outlined"
      >
        <option value="option1">option1</option>
      </PlaceholderActionsDropdown>
    </Hidden>
  );
};
