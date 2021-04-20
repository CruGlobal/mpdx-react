import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { CheckBox, CheckBoxState } from './CheckBox';

export default {
  title: 'Contacts/ContactRow/Widgets/CheckBox',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <CheckBox state={CheckBoxState.unchecked} onClick={() => {}} />
    </Box>
  );
};

export const Checked = (): ReactElement => {
  return (
    <Box m={2}>
      <CheckBox state={CheckBoxState.checked} onClick={() => {}} />
    </Box>
  );
};

export const Partial = (): ReactElement => {
  return (
    <Box m={2}>
      <CheckBox state={CheckBoxState.partial} onClick={() => {}} />
    </Box>
  );
};
