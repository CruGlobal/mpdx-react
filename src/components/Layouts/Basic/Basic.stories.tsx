import React, { ReactElement } from 'react';
import { Container, Box } from '@mui/material';
import Basic from '.';

export default {
  title: 'Layouts/Basic',
};

export const Default = (): ReactElement => {
  return (
    <Basic>
      <Container>
        <Box my={2}>Basic Layout</Box>
      </Container>
    </Basic>
  );
};
