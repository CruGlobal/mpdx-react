import React, { ReactElement } from 'react';
import { Container, Box } from '@material-ui/core';
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
