import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { ContactCheckBox, ContactCheckBoxState } from './ContactCheckBox';

export default {
  title: 'Contacts/ContactRow/Widgets/CheckBox',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactCheckBox
        state={ContactCheckBoxState.unchecked}
        onClick={() => {}}
      />
    </Box>
  );
};

export const Checked = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactCheckBox
        state={ContactCheckBoxState.checked}
        onClick={() => {}}
      />
    </Box>
  );
};

export const Partial = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactCheckBox
        state={ContactCheckBoxState.partial}
        onClick={() => {}}
      />
    </Box>
  );
};
