import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { boolean } from '@storybook/addon-knobs';
import GiftStatus from '.';

export default {
  title: 'Contacts/GiftStatus',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus
        isHidden={boolean('isHidden', true)}
        isLate={boolean('isLate', false)}
      />
    </Box>
  );
};
export const LateStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus
        isHidden={boolean('isHidden', false)}
        isLate={boolean('isLate', true)}
      />
    </Box>
  );
};
export const OnTimeStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus
        isHidden={boolean('isHidden', false)}
        isLate={boolean('isLate', false)}
      />
    </Box>
  );
};
