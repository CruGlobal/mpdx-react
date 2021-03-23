import { Box } from '@material-ui/core';
import { array, text } from '@storybook/addon-knobs';
import React, { ReactElement } from 'react';
import { StatusSelector } from './StatusSelector';

export default {
  title: 'Contacts/ContactView/Widgets/StatusSelector',
};
export const Default = (): ReactElement => {
  const values = ['Partner - Financial', 'Unknown'];
  const knobValue = array('statuses', values);
  return (
    <Box m={2}>
      <StatusSelector
        statuses={knobValue}
        selectedStatus={text('selectedStatus', 'Unknown')}
      />
    </Box>
  );
};
