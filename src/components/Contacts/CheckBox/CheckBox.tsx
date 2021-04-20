import { Checkbox, CheckboxProps, styled } from '@material-ui/core';
import React from 'react';
import theme from '../../../theme';

export enum CheckBoxState {
  'unchecked',
  'checked',
  'partial',
}

interface Props {
  state?: CheckBoxState;
  onClick?: () => void;
}

const StyledCheckBox = styled(Checkbox)(({ checked }: CheckboxProps) => ({
  width: '18px',
  height: '18px',
  color: checked ? theme.palette.primary.dark : theme.palette.secondary.dark,
}));

export const CheckBox: React.FC<Props> = ({
  state = CheckBoxState.unchecked,
  onClick,
}) => {
  const checked = state != CheckBoxState.unchecked;
  const indeterminate = state === CheckBoxState.partial;

  return (
    <StyledCheckBox
      color="default"
      checked={checked}
      indeterminate={indeterminate}
      onClick={onClick}
    />
  );
};
