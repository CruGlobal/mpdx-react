import { Box } from '@material-ui/core';
import { array, text } from '@storybook/addon-knobs';
import React, { ReactElement } from 'react';
import { FrequencySelector } from './FrequencySelector';

export default {
  title: 'Contacts/ContactView/Widgets/FrequencySelector',
};

export const Default = (): ReactElement => {
  const values = ['Monthly', 'Quarterly', 'Annually'];
  const knobValue = array('frequencies', values);
  return (
    <Box m={2}>
      <FrequencySelector
        frequencies={knobValue}
        selectedFrequency={text('frequency', 'Monthly')}
        saveFrequency={null}
      />
    </Box>
  );
};
