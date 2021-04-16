import { Checkbox, styled } from '@material-ui/core';
import React from 'react';
import theme from '../../../../theme';

export enum CheckBoxState {
  'unchecked',
  'checked',
  'indeterminate',
}

interface Props {
  state?: CheckBoxState;
}

const StyledCheckBox = styled(Checkbox)(({}) => ({
  //display: 'inline-block',
  //width: '18px',
  //height: '18px',
  color: 'red',
  '&$checked': {
    color: 'blue',
  },
  //checked: {
  //  backgroundColor: 'red',
  //},
  //indeterminate: {
  //  color: theme.palette.primary.dark,
  //},
}));

export const CheckBox: React.FC<Props> = ({
  state = CheckBoxState.unchecked,
}) => {
  switch (state) {
    case CheckBoxState.unchecked:
      return (
        <StyledCheckBox color="default" checked={true} indeterminate={false} />
      );

    case CheckBoxState.checked:
      return <Checkbox />;

    case CheckBoxState.indeterminate:
      return <Checkbox />;
  }
};
