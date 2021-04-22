import { Checkbox, CheckboxProps, styled } from '@material-ui/core';
import React from 'react';
import theme from '../../../theme';

export enum ContactCheckBoxState {
  'unchecked',
  'checked',
  'partial',
}

interface Props {
  state?: ContactCheckBoxState;
  onClick?: () => void;
}

const StyledCheckBox = styled(Checkbox)(({ checked }: CheckboxProps) => ({
  width: '18px',
  height: '18px',
  color: checked ? theme.palette.primary.dark : theme.palette.secondary.dark,
}));

export const ContactCheckBox: React.FC<Props> = ({
  state = ContactCheckBoxState.unchecked,
  onClick,
}) => {
  const checked = state != ContactCheckBoxState.unchecked;
  const indeterminate = state === ContactCheckBoxState.partial;

  return (
    <StyledCheckBox
      color="default"
      checked={checked}
      indeterminate={indeterminate}
      onClick={onClick}
    />
  );
};
