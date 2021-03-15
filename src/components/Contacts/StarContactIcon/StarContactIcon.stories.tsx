import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { boolean } from '@storybook/addon-knobs';
import { StarContactIcon } from './StarContactIcon';

export default {
  title: 'Contacts/ContactRow/Widgets/StaredContact',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <StarContactIcon hasStar={boolean('hasStar', false)} />
    </Box>
  );
};

export const IsStared = (): ReactElement => {
  return (
    <Box m={2}>
      <StarContactIcon hasStar={boolean('hasStar', true)} />
    </Box>
  );
};
