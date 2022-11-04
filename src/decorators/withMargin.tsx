import React, { ReactElement } from 'react';
import { Box } from '@mui/material';

const withMargin = (StoryFn: () => ReactElement): ReactElement => (
  <Box m={2}>
    <StoryFn />
  </Box>
);

export default withMargin;
