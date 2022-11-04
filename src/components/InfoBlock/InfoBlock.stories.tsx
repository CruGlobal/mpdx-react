import React, { ReactElement } from 'react';
import { Box } from '@mui/material';
import InfoBlock from '.';

export default {
  title: 'InfoBlock',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <InfoBlock title={'Heading'}>Hello World</InfoBlock>
    </Box>
  );
};
